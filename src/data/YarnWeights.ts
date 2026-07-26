import type { YarnWeight } from "../types/YarnWeight";
export const YarnWeights: readonly YarnWeight[] = [
  {
    id: "cobweb",
    name: "Cobweb",
    standardWeight: 0,
    ply: "1 ply",
    wrapsPerInch: "20+",
    gauge10cm: "36+ stitches",
    recommendedHooks: [1.2, 1.4],
  },

  {
    id: "lace",
    name: "Lace",
    standardWeight: 0,
    ply: "2 ply",
    wrapsPerInch: "18",
    gauge10cm: "32–34 stitches",
    recommendedHooks: [1.4, 1.6],
  },

  {
    id: "sock",
    name: "Sock / Light Fingering",
    standardWeight: 0,
    ply: "3 ply",
    wrapsPerInch: "16",
    gauge10cm: "32 stitches",
    recommendedHooks: [2.25, 2.5, 2.75],
  },

  {
    id: "fingering",
    name: "Fingering",
    standardWeight: 1,
    ply: "4 ply",
    wrapsPerInch: "14",
    gauge10cm: "28 stitches",
    recommendedHooks: [3, 3.5],
  },

  {
    id: "sport",
    name: "Sport",
    standardWeight: 2,
    ply: "5 ply",
    wrapsPerInch: "12",
    gauge10cm: "24–26 stitches",
    recommendedHooks: [3.5, 4, 4.5],
  },

  {
    id: "dk",
    name: "DK",
    standardWeight: 3,
    ply: "8 ply",
    wrapsPerInch: "11",
    gauge10cm: "22 stitches",
    recommendedHooks: [4.5, 5, 5.5],
  },

  {
    id: "worsted",
    name: "Worsted / Aran",
    standardWeight: 4,
    ply: "10 ply",
    wrapsPerInch: "8–9",
    gauge10cm: "20 stitches",
    recommendedHooks: [5.5, 6, 6.5],
  },

  {
    id: "bulky",
    name: "Bulky / Chunky",
    standardWeight: 5,
    ply: "12 ply",
    wrapsPerInch: "7",
    gauge10cm: "14–15 stitches",
    recommendedHooks: [6.5, 7, 8, 9],
  },

  {
    id: "superBulky",
    name: "Super Bulky",
    standardWeight: 6,
    ply: "",
    wrapsPerInch: "5–6",
    gauge10cm: "8–12 stitches",
    recommendedHooks: [9, 10, 12],
  },
];
