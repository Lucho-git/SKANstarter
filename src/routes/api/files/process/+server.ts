import { error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from "$env/static/public";
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private";
import JSZip from 'jszip';
import shapefile from 'shapefile';
import { DOMParser } from '@xmldom/xmldom';
import { kml } from '@tmcw/togeojson';

const supabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE);

export async function POST({ request, locals }) {
    const session = await locals.getSession();
    if (!session || !session.user) {
        throw error(401, 'Unauthorized');
    }

    const userId = session.user.id;
    const { fileName } = await request.json();

    if (!fileName) {
        throw error(400, 'File name is required');
    }

    try {
        const filePath = `user_${userId}/${fileName}`;

        // Download the file
        const { data, error: downloadError } = await supabase
            .storage
            .from('user_files_bucket')
            .download(filePath);

        if (downloadError) {
            throw error(500, downloadError.message);
        }

        if (!data) {
            throw error(404, 'File not found');
        }

        // Process the file
        const result = await processFile(await data.arrayBuffer(), fileName);

        if (result.status === 'error') {
            throw error(400, result.message);
        }

        // Return the extracted paddock data
        return new Response(JSON.stringify({ message: result.message, paddocks: result.paddocks || [], geojson: result.geojson }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error processing file:', err);
        throw error(500, 'An error occurred while processing the file');
    }
}

async function processFile(fileData, fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();

    if (fileExtension === 'kml') {
        return processKML(fileData);
    } else if (fileExtension === 'zip') {
        return processZIP(fileData);
    } else if (fileExtension === 'xml') {
        const decoder = new TextDecoder('utf-8');
        const xmlContent = decoder.decode(new Uint8Array(fileData));
        return processISOXML(xmlContent);
    } else {
        return { status: 'error', message: 'Invalid file type. Please upload a zip, KML, or XML file.' };
    }
}

async function processKML(fileData) {
    try {
        const decoder = new TextDecoder('utf-8');
        const kmlContent = decoder.decode(new Uint8Array(fileData));

        const kmlDoc = new DOMParser().parseFromString(kmlContent, 'text/xml');
        const geojson = kml(kmlDoc);

        const paddockList = geojson.features.map((feature, index) => {
            const properties = feature.properties;
            const paddockName = findPaddockName(properties) || `ImportPaddock${index + 1}`;

            return {
                name: paddockName,
                properties: properties,
                boundary: feature.geometry
            };
        }).filter(paddock => paddock.boundary !== null);

        if (paddockList.length === 0) {
            return { status: 'error', message: 'No valid paddocks found with boundary data in KML file.' };
        }

        return {
            status: 'success',
            message: `Found ${paddockList.length} valid paddock${paddockList.length !== 1 ? 's' : ''} in KML file.`,
            paddocks: paddockList,
            geojson: {
                type: "FeatureCollection",
                features: paddockList.map(paddock => ({
                    type: "Feature",
                    properties: {
                        ...paddock.properties,
                        name: paddock.name
                    },
                    geometry: paddock.boundary
                }))
            }
        };
    } catch (error) {
        console.error('Error processing KML file:', error);
        return { status: 'error', message: 'Error processing the KML file.' };
    }
}

async function processShapefile(shpFile, dbfFile, shxFile) {
    try {
        const paddockList = [];
        const source = await shapefile.open(shpFile, dbfFile, { 'shx': shxFile });

        let result;
        let index = 0;
        while (!(result = await source.read()).done) {
            const feature = result.value;
            const properties = feature.properties;
            const geometry = feature.geometry;

            if (geometry !== null) {
                const paddockName = findPaddockName(properties) || `ImportPaddock${index + 1}`;

                paddockList.push({
                    name: paddockName,
                    properties: properties,
                    boundary: geometry
                });

                index++;
            }
        }

        if (paddockList.length === 0) {
            return { status: 'error', message: 'No valid paddocks found with boundary data in shapefile.' };
        }

        return {
            status: 'success',
            message: `Found ${paddockList.length} valid paddock${paddockList.length !== 1 ? 's' : ''} in shapefile.`,
            paddocks: paddockList,
            geojson: {
                type: "FeatureCollection",
                features: paddockList.map(paddock => ({
                    type: "Feature",
                    properties: {
                        ...paddock.properties,
                        name: paddock.name
                    },
                    geometry: paddock.boundary
                }))
            }
        };
    } catch (error) {
        console.error('Error processing shapefile:', error);
        return { status: 'error', message: 'Error processing the shapefile.' };
    }
}

async function processZIP(fileData) {
    const zip = new JSZip();

    try {
        const contents = await zip.loadAsync(fileData);
        const files = Object.keys(contents.files);

        // Check for required shapefile components
        const requiredExtensions = ['.shp', '.shx', '.dbf'];
        const hasAllComponents = requiredExtensions.every(ext =>
            files.some(file => file.toLowerCase().endsWith(ext))
        );

        if (hasAllComponents) {
            const shpFileName = files.find(file => file.toLowerCase().endsWith('.shp'));
            const shxFileName = files.find(file => file.toLowerCase().endsWith('.shx'));
            const dbfFileName = files.find(file => file.toLowerCase().endsWith('.dbf'));

            const shpFile = await contents.file(shpFileName).async('nodebuffer');
            const shxFile = await contents.file(shxFileName).async('nodebuffer');
            const dbfFile = await contents.file(dbfFileName).async('nodebuffer');

            return processShapefile(shpFile, dbfFile, shxFile);
        }

        // Check for KML file inside ZIP
        const kmlFileName = files.find(file => file.toLowerCase().endsWith('.kml'));
        if (kmlFileName) {
            const kmlFileContent = await contents.file(kmlFileName).async('arraybuffer');
            return processKML(kmlFileContent);
        }

        // Check for XML file (assuming it's ISOXML)
        const xmlFileName = files.find(file => file.toLowerCase().endsWith('.xml'));
        if (xmlFileName) {
            const xmlContent = await contents.file(xmlFileName).async('text');
            return processISOXML(xmlContent);
        }

        return { status: 'error', message: 'No valid data files found in the zip archive.' };
    } catch (error) {
        console.error('Error processing zip file:', error);
        return { status: 'error', message: 'Error processing the zip file.' };
    }
}

function processISOXML(xmlContent) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

        console.log("Parsed XML structure:");
        logXMLStructure(xmlDoc, 0);

        // Check if it's a valid ISOXML file
        const isoxml = xmlDoc.getElementsByTagName('ISO11783_TaskData')[0];
        if (!isoxml) {
            return { status: 'error', message: 'Not a valid ISOXML file.' };
        }

        console.log("ISOXML root element attributes:");
        Array.from(isoxml.attributes).forEach(attr => {
            console.log(`  ${attr.name}: ${attr.value}`);
        });

        const paddockList = [];
        let totalExclusions = 0;

        // Process farms (FRM elements)
        const farms = xmlDoc.getElementsByTagName('FRM');
        console.log(`\nFound ${farms.length} farms:`);
        for (let i = 0; i < farms.length; i++) {
            const farm = farms[i];
            const farmId = farm.getAttribute('A');
            const farmName = farm.getAttribute('B');
            console.log(`  Farm ${i + 1}: ID=${farmId}, Name=${farmName}`);
        }

        // Process partfields (paddocks)
        const partfields = xmlDoc.getElementsByTagName('PFD');
        console.log(`\nFound ${partfields.length} partfields (paddocks):`);
        for (let i = 0; i < partfields.length; i++) {
            const partfield = partfields[i];
            const paddockId = partfield.getAttribute('A');
            const paddockName = partfield.getAttribute('C') || `ImportPaddock${i + 1}`;
            const areaValue = partfield.getAttribute('D');
            const farmId = partfield.getAttribute('F');

            console.log(`  Paddock ${i + 1}: ID=${paddockId}, Name=${paddockName}, Area=${areaValue}, FarmID=${farmId}`);

            // Process polygons for this partfield
            const polygons = partfield.getElementsByTagName('PLN');
            let boundaryCoordinates = [];

            if (polygons.length > 0) {
                const lineStrings = polygons[0].getElementsByTagName('LSG');
                for (let j = 0; j < lineStrings.length; j++) {
                    const lsg = lineStrings[j];
                    const lsgType = lsg.getAttribute('A');
                    const points = lsg.getElementsByTagName('PNT');
                    const ringCoordinates = [];

                    for (let k = 0; k < points.length; k++) {
                        const point = points[k];
                        const lat = parseFloat(point.getAttribute('C'));
                        const lon = parseFloat(point.getAttribute('D'));
                        ringCoordinates.push([lon, lat]);
                    }

                    // Close the polygon
                    ringCoordinates.push(ringCoordinates[0]);

                    if (lsgType === "1") {
                        // Main boundary
                        boundaryCoordinates.unshift(ringCoordinates);
                    } else if (lsgType === "2") {
                        // Exclusion
                        boundaryCoordinates.push(ringCoordinates);
                        totalExclusions++;
                    }
                }
            }

            if (boundaryCoordinates.length > 0) {
                // Create a paddock object
                const paddock = {
                    name: paddockName,
                    properties: {
                        id: paddockId,
                        area: areaValue,
                        farmId: farmId
                    },
                    boundary: {
                        type: "Polygon",
                        coordinates: boundaryCoordinates
                    }
                };

                paddockList.push(paddock);

                console.log(`    Number of exclusions: ${boundaryCoordinates.length - 1}`);
            }
        }

        if (paddockList.length === 0) {
            return { status: 'error', message: 'No valid paddocks found with boundary data in ISOXML file.' };
        }

        console.log(`\nTotal number of exclusions in the ISOXML file: ${totalExclusions}`);

        // Create a GeoJSON FeatureCollection
        const geojson = {
            type: "FeatureCollection",
            features: paddockList.map(paddock => ({
                type: "Feature",
                properties: {
                    ...paddock.properties,
                    name: paddock.name
                },
                geometry: paddock.boundary
            }))
        };

        return {
            status: 'success',
            message: `Found ${paddockList.length} valid paddock${paddockList.length !== 1 ? 's' : ''} in ISOXML file with a total of ${totalExclusions} exclusion${totalExclusions !== 1 ? 's' : ''}.`,
            paddocks: paddockList,
            geojson: geojson
        };
    } catch (error) {
        console.error('Error processing ISOXML file:', error);
        return { status: 'error', message: 'Error processing the ISOXML file.' };
    }
}

function logXMLStructure(node, level) {
    const indent = '  '.repeat(level);
    if (node.nodeType === 1) { // ELEMENT_NODE
        console.log(`${indent}${node.nodeName}`);
        if (node.attributes.length > 0) {
            console.log(`${indent}  Attributes:`);
            Array.from(node.attributes).forEach(attr => {
                console.log(`${indent}    ${attr.name}: ${attr.value}`);
            });
        }
        Array.from(node.childNodes).forEach(child => logXMLStructure(child, level + 1));
    } else if (node.nodeType === 3 && node.nodeValue.trim()) { // TEXT_NODE with non-empty content
        console.log(`${indent}"${node.nodeValue.trim()}"`);
    }
}

function findPaddockName(properties) {
    const possibleNameFields = ['name', 'NAME', 'Name', 'PaddockName', 'PADDOCK_NAME', 'paddock_name', 'PADDOCKNAME', 'FIELD_NAME'];
    for (const field of possibleNameFields) {
        if (properties[field]) {
            return properties[field];
        }
    }
    return null;
}