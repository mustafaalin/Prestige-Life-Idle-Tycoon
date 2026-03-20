export interface LocalBusinessPrestigePoints {
  business_id: string;
  base_points: number;
  level1_points: number;
  level2_points: number;
  level3_points: number;
  level4_points: number;
  level5_points: number;
  level6_points: number;
}

const rows = [
  ['126a38d8-2899-4f5a-b5bd-57852bec7b2e', 129, 129, 172, 237, 366, 560, 818],
  ['12d1ae4a-81f9-476e-b7db-a46050445398', 385, 385, 513, 706, 1091, 1669, 2439],
  ['2038ff34-a7d0-40b6-99cb-92cd95abe5fd', 229, 229, 305, 420, 649, 993, 1451],
  ['223c3c2b-bcda-4699-8f71-46a65b3d47e0', 650, 650, 867, 1192, 1842, 2817, 4117],
  ['276c3d65-f58c-4242-a60e-8ea52741c563', 127, 127, 169, 233, 360, 551, 805],
  ['281829d9-2506-464f-81f4-a52c823b87d8', 121, 121, 161, 222, 343, 525, 767],
  ['2b2097ab-97b1-4482-b9bc-9f46a69b0539', 64, 64, 85, 117, 181, 277, 405],
  ['2c39fe73-b9e7-448d-b0c9-21633460663f', 54, 54, 72, 99, 153, 234, 342],
  ['3843025d-caa0-4f9c-9c91-5787767689d9', 38, 38, 51, 70, 108, 165, 241],
  ['3cc8cf15-74d2-455e-afdc-c315e5fcfe04', 612, 612, 816, 1122, 1734, 2652, 3876],
  ['49d83933-de49-46ea-8689-d8b60121daf8', 116, 116, 155, 213, 329, 503, 735],
  ['4be16123-2b52-4a47-b089-c731a81c26d2', 407, 407, 543, 747, 1154, 1765, 2579],
  ['4d8befa8-2815-4ada-94fe-a4057222fa42', 15, 15, 20, 28, 43, 66, 96],
  ['510c0e5e-cffa-4c76-bd20-628d249b0777', 98, 98, 131, 180, 278, 425, 621],
  ['52415bad-45a4-46ad-bd7f-103168df3960', 104, 104, 139, 191, 295, 451, 659],
  ['654ff4d9-d043-430a-808d-07ae13ec7a08', 580, 580, 773, 1063, 1643, 2513, 3673],
  ['68651004-c050-4bde-8844-421629f9f4f9', 29, 29, 39, 54, 83, 127, 185],
  ['6a850818-09d2-4542-b749-cd978a48ff31', 472, 472, 629, 865, 1337, 2045, 2989],
  ['7072b8e6-f4a0-4e99-b143-2bae8c5cc7ca', 533, 533, 711, 978, 1511, 2311, 3377],
  ['7811debb-a288-4086-93d7-33352cf8ab78', 160, 160, 213, 293, 453, 693, 1013],
  ['79a4e5a3-a24b-4500-ba31-3bb343c7ab08', 124, 124, 165, 227, 351, 537, 785],
  ['7cc5deb8-86b9-479f-9337-0eca071d4bc8', 335, 335, 447, 615, 950, 1453, 2123],
  ['8744ae92-5cef-459a-b79d-cb7525b33a83', 258, 258, 344, 473, 731, 1118, 1634],
  ['8a741309-64e9-4886-be17-fe773178f669', 129, 129, 172, 237, 366, 560, 818],
  ['8bdaae0e-9f3a-4017-b9e5-a902e88dd974', 23, 23, 31, 43, 66, 101, 147],
  ['8c249a3b-540c-4830-bf2a-70bbae3515e7', 492, 492, 656, 902, 1394, 2132, 3116],
  ['8f973e0f-aef9-4457-ac1c-3019462d20bd', 90, 90, 120, 165, 255, 390, 570],
  ['91797c51-2aaa-4715-bdf9-0e70d69d21fc', 46, 46, 61, 84, 130, 199, 291],
  ['9bf6864f-305d-49cc-b994-df23e3f11e0f', 427, 427, 569, 783, 1210, 1851, 2705],
  ['c1b76851-bec3-4791-baa2-458ae6cdc55f', 130, 130, 173, 238, 368, 563, 823],
  ['cdb65128-3745-45fb-a291-12be40b5b079', 358, 358, 477, 656, 1014, 1551, 2267],
  ['cdf265c5-9769-4d0b-8455-e97e9e7ceaf0', 450, 450, 600, 825, 1275, 1950, 2850],
  ['d37be3c1-c699-4b77-89f6-10e975971752', 82, 82, 109, 150, 232, 355, 519],
  ['d4452a96-74ad-40a2-999d-ed557200f785', 312, 312, 416, 572, 884, 1352, 1976],
  ['d6c9815d-5e3f-410d-9ab8-6b4e7ed73371', 111, 111, 148, 204, 315, 482, 704],
  ['dbc58872-1a4f-4e3b-a429-de00a7054bae', 555, 555, 740, 1018, 1573, 2406, 3516],
  ['f19ba49c-3f6c-47e6-9866-8aed6fb55e77', 279, 279, 372, 512, 791, 1210, 1768],
  ['f88345f3-775b-48f1-960f-566372a6788f', 203, 203, 271, 373, 576, 881, 1287],
  ['f988038d-b067-4b73-9e82-c2e341cb3e07', 74, 74, 99, 136, 210, 321, 469],
  ['fb711a33-9512-4a89-93fd-12117a60e661', 512, 512, 683, 939, 1451, 2219, 3243],
] as const;

export const LOCAL_BUSINESS_PRESTIGE_POINTS: LocalBusinessPrestigePoints[] = rows.map(
  ([business_id, base_points, level1_points, level2_points, level3_points, level4_points, level5_points, level6_points]) => ({
    business_id,
    base_points,
    level1_points,
    level2_points,
    level3_points,
    level4_points,
    level5_points,
    level6_points,
  })
);

export function getBusinessPrestigeForLevel(businessId: string, level: number): number {
  const row = LOCAL_BUSINESS_PRESTIGE_POINTS.find((entry) => entry.business_id === businessId);
  if (!row) return 0;

  switch (level) {
    case 1:
      return row.level1_points ?? row.base_points;
    case 2:
      return row.level2_points ?? row.base_points;
    case 3:
      return row.level3_points ?? row.base_points;
    case 4:
      return row.level4_points ?? row.base_points;
    case 5:
      return row.level5_points ?? row.base_points;
    case 6:
      return row.level6_points ?? row.base_points;
    default:
      return row.base_points;
  }
}
