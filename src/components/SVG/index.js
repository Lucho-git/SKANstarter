import SimpleTractor from './SimpleTractor.svelte';
import Pointer from './Pointer.svelte';
import CombineHarvester from './CombineHarvester.svelte';
import Excavator from './Excavator.svelte';
import Tractor from './Tractor.svelte';
import WheelLoader from './WheelLoader.svelte';
import WorkCar from './WorkCar.svelte';
import Airplane from './Airplane.svelte';

export default {
    SimpleTractor: () => import('./SimpleTractor.svelte'),
    Pointer: () => import('./Pointer.svelte'),
    CombineHarvester: () => import('./CombineHarvester.svelte'),
    Excavator: () => import('./Excavator.svelte'),
    Tractor: () => import('./Tractor.svelte'),
    WheelLoader: () => import('./WheelLoader.svelte'),
    WorkCar: () => import('./WorkCar.svelte'),
    Airplane: () => import('./Airplane.svelte'),
  };
  