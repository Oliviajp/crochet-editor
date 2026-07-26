import type { YarnMaterial } from "../types/YarnMaterial"

export const YarnMaterials: readonly YarnMaterial[] = [
  {
    id: "cotton",
    name: "Cotton",

    animalFiber: false,
    plantFiber: true,
    syntheticFiber: false,

    warm: false,
    breathable: true,
    stretchy: false,
    durable: true,

    machineWashable: true
  },

  {
    id: "wool",
    name: "Wool",

    animalFiber: true,
    plantFiber: false,
    syntheticFiber: false,

    warm: true,
    breathable: true,
    stretchy: true,
    durable: true,

    machineWashable: false
  },

  {
    id: "acrylic",
    name: "Acrylic",

    animalFiber: false,
    plantFiber: false,
    syntheticFiber: true,

    warm: true,
    breathable: false,
    stretchy: true,
    durable: true,

    machineWashable: true
  },

  {
    id: "alpaca",
    name: "Alpaca",

    animalFiber: true,
    plantFiber: false,
    syntheticFiber: false,

    warm: true,
    breathable: true,
    stretchy: false,
    durable:true,

    machineWashable: false
  },

  {
    id: "mohair",
    name: "Mohair",

    animalFiber: true,
    plantFiber: false,
    syntheticFiber: false,

    warm: true,
    breathable: true,
    stretchy: false,
    durable: false,

    machineWashable: false
  },

  {
    id: "silk",
    name: "Silk",

    animalFiber: true,
    plantFiber: false,
    syntheticFiber: false,

    warm: false,
    breathable: true,
    stretchy: false,
    durable: true,

    machineWashable: false
  },

  {
    id: "linen",
    name: "Linen",

    animalFiber: false,
    plantFiber: true,
    syntheticFiber: false,

    warm: false,
    breathable: true,
    stretchy: false,
    durable: true,

    machineWashable: true
  },

  {
    id: "bamboo",
    name: "Bamboo",

    animalFiber: false,
    plantFiber: true,
    syntheticFiber: false,

    warm: false,
    breathable: true,
    stretchy: false,
    durable: true,

    machineWashable: true
  },

  {
    id: "nylon",
    name: "Nylon",

    animalFiber: false,
    plantFiber: false,
    syntheticFiber: true,

    warm: false,
    breathable: false,
    stretchy: true,
    durable: true,

    machineWashable: true
  },

  {
    id: "polyester",
    name: "Polyester",

    animalFiber: false,
    plantFiber: false,
    syntheticFiber: true,

    warm: false,
    breathable: false,
    stretchy: true,
    durable: true,

    machineWashable: true
  },

  {
    id: "cashmere",
    name: "Cashmere",

    animalFiber: true,
    plantFiber: false,
    syntheticFiber: false,

    warm: true,
    breathable: true,
    stretchy: false,
    durable: false,

    machineWashable: false
  },

  {
    id: "hemp",
    name: "Hemp",

    animalFiber: false,
    plantFiber: true,
    syntheticFiber: false,

    warm: false,
    breathable: true,
    stretchy: false,
    durable: true,

    machineWashable: true
  }
]