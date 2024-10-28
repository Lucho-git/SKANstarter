// pathSimplification.js

export function simplifyPath(data, tolerance) {
    const points = data.map((point) => ({
      x: parseFloat(point.coordinates.match(/\((.*?),(.*?)\)/)[1]),
      y: parseFloat(point.coordinates.match(/\((.*?),(.*?)\)/)[2]),
    }));
  
    if (points.length <= 2) {
      return data;
    }
  
    const simplifiedIndices = douglasPeucker(points, 0, points.length - 1, tolerance);
    return simplifiedIndices.map(index => data[index]);
  }
  
  function douglasPeucker(points, startIndex, endIndex, tolerance) {
    let maxDistance = 0;
    let index = 0;
  
    for (let i = startIndex + 1; i < endIndex; i++) {
      const distance = perpendicularDistance(points[i], points[startIndex], points[endIndex]);
      if (distance > maxDistance) {
        index = i;
        maxDistance = distance;
      }
    }
  
    if (maxDistance > tolerance) {
      const results1 = douglasPeucker(points, startIndex, index, tolerance);
      const results2 = douglasPeucker(points, index, endIndex, tolerance);
      return [...results1.slice(0, -1), ...results2];
    } else {
      return [startIndex, endIndex];
    }
  }
  
  function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const numerator = Math.abs(
      dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x
    );
    const denominator = Math.sqrt(dx * dx + dy * dy);
    return numerator / denominator;
  }
  