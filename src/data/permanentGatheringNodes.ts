export interface PermanentGatheringNodeSeedItem {
  id: number;
  quantity: number;
  ore?: boolean;
}

export interface PermanentGatheringNodeSeed {
  id: number;
  image: string;
  area: string;
  zone: string;
  region: string;
  materialName: string;
  waypointName?: string;
  waypointCode?: string;
  optimal: number;
  videoGuide?: string;
  items: PermanentGatheringNodeSeedItem[];
}

export const PERMANENT_GATHERING_NODE_SOURCE_URL = "https://gw2efficiency.com/gathering/permanent-nodes";
export const PERMANENT_GATHERING_NODE_IMAGE_BASE_URL = "https://gw2efficiency.com/assets/gathering/permanent/";

// Extracted from gw2efficiency's public permanent gathering node route data on 2026-06-23.
export const PERMANENT_GATHERING_NODE_SEEDS: PermanentGatheringNodeSeed[] = [
  {
    "id": 31,
    "image": "Fields of Ruin - Perma Grapes.jpg",
    "area": "Wildlin Narrows",
    "zone": "Fields of Ruin",
    "region": "Ascalon",
    "materialName": "Grapes",
    "waypointName": "Ogre Road Waypoint",
    "waypointCode": "[&BE8BAAA=]",
    "optimal": 101,
    "items": [
      {
        "id": 12341,
        "quantity": 8
      }
    ]
  },
  {
    "id": 32,
    "image": "Fields of Ruin - Perma Rich Iron.jpg",
    "area": "Dragonrot Domains",
    "zone": "Fields of Ruin",
    "region": "Ascalon",
    "materialName": "Rich Iron",
    "waypointName": "Helliot Mine Waypoint",
    "waypointCode": "[&BEsBAAA=]",
    "optimal": 102,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 34,
    "image": "Fields of Ruin - Perma Rich Gold.jpg",
    "area": "Highden Caves",
    "zone": "Fields of Ruin",
    "region": "Ascalon",
    "materialName": "Rich Gold",
    "waypointName": "Fangfury Watch Waypoint",
    "waypointCode": "[&BEwBAAA=]",
    "optimal": 103,
    "items": [
      {
        "id": 19698,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 33,
    "image": "Fields of Ruin - Perma Rich Silver.jpg",
    "area": "Halkor Meadows",
    "zone": "Fields of Ruin",
    "region": "Ascalon",
    "materialName": "Rich Silver",
    "waypointName": "Rosko's Campsite Waypoint",
    "waypointCode": "[&BNgAAAA=]",
    "optimal": 104,
    "items": [
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 39,
    "image": "Blazeridge Steppes - Perma Rich Iron.jpg",
    "area": "Behem Gauntlet",
    "zone": "Blazeridge Steppes",
    "region": "Ascalon",
    "materialName": "Rich Iron",
    "waypointName": "Behem Waypoint",
    "waypointCode": "[&BP0BAAA=]",
    "optimal": 201,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 38,
    "image": "Blazeridge Steppes - Perma Cabbage.jpg",
    "area": "Heretic Plain",
    "zone": "Blazeridge Steppes",
    "region": "Ascalon",
    "materialName": "Cabbage",
    "waypointName": "Lunk Kraal Waypoint",
    "waypointCode": "[&BAACAAA=]",
    "optimal": 202,
    "items": [
      {
        "id": 12332,
        "quantity": 8
      }
    ]
  },
  {
    "id": 40,
    "image": "Blazeridge Steppes - Perma Rich Gold.jpg",
    "area": "Terra Carorunda",
    "zone": "Blazeridge Steppes",
    "region": "Ascalon",
    "materialName": "Rich Gold",
    "waypointName": "Terra Carorunda Waypoint",
    "waypointCode": "[&BAECAAA=]",
    "optimal": 203,
    "items": [
      {
        "id": 19698,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 47,
    "image": "Iron Marches - Perma Rich Platinum.jpg",
    "area": "Ebbing Heart Run",
    "zone": "Iron Marches",
    "region": "Ascalon",
    "materialName": "Rich Platinum",
    "waypointName": "Grostogg's Kraal Waypoint",
    "waypointCode": "[&BO8BAAA=]",
    "optimal": 301,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 48,
    "image": "Iron Marches - Perma Rich Platinum 2.jpg",
    "area": "Gladefall Run",
    "zone": "Iron Marches",
    "region": "Ascalon",
    "materialName": "Rich Platinum",
    "waypointName": "Gladefall Waypoint",
    "waypointCode": "[&BO4BAAA=]",
    "optimal": 302,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 46,
    "image": "Iron Marches - Perma Sugar Pumpkins.jpg",
    "area": "Victium Moors",
    "zone": "Iron Marches",
    "region": "Ascalon",
    "materialName": "Sugar Pumpkins",
    "waypointName": "Bulwark Waypoint",
    "waypointCode": "[&BOwBAAA=]",
    "optimal": 303,
    "items": [
      {
        "id": 12538,
        "quantity": 8
      }
    ]
  },
  {
    "id": 1,
    "image": "Plains of Ashford - Perma Potatoes.jpg",
    "area": "Loreclaw Expanse",
    "zone": "Plains of Ashford",
    "region": "Ascalon",
    "materialName": "Potatoes",
    "waypointName": "Loreclaw Waypoint",
    "waypointCode": "[&BMcDAAA=]",
    "optimal": 401,
    "items": [
      {
        "id": 12135,
        "quantity": 8
      }
    ]
  },
  {
    "id": 2,
    "image": "Plains of Ashford - Perma Rich Copper.jpg",
    "area": "Windrock Maze",
    "zone": "Plains of Ashford",
    "region": "Ascalon",
    "materialName": "Rich Copper",
    "waypointName": "Ashford Waypoint",
    "waypointCode": "[&BIQBAAA=]",
    "optimal": 402,
    "items": [
      {
        "id": 19697,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 3,
    "image": "Plains of Ashford - Perma Rich Copper 2.jpg",
    "area": "Victor's Presidium",
    "zone": "Plains of Ashford",
    "region": "Ascalon",
    "materialName": "Rich Copper",
    "waypointName": "Guardpoint Decimus Waypoint",
    "waypointCode": "[&BJgDAAA=]",
    "optimal": 403,
    "items": [
      {
        "id": 19697,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 11,
    "image": "Diessa Plateau - Perma Strawberry Patch.jpg",
    "area": "Town of Nolan",
    "zone": "Diessa Plateau",
    "region": "Ascalon",
    "materialName": "Strawberries",
    "waypointName": "Nolan Waypoint",
    "waypointCode": "[&BN4AAAA=]",
    "optimal": 501,
    "items": [
      {
        "id": 12253,
        "quantity": 8
      }
    ]
  },
  {
    "id": 12,
    "image": "Diessa Plateau - Perma Rich Iron.jpg",
    "area": "Arcovian Foothills",
    "zone": "Diessa Plateau",
    "region": "Ascalon",
    "materialName": "Rich Iron",
    "waypointName": "Oldgate Waypoint",
    "waypointCode": "[&BF4BAAA=]",
    "optimal": 502,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 13,
    "image": "Diessa Plateau - Perma Rich Silver.jpg",
    "area": "The Blasted Moors",
    "zone": "Diessa Plateau",
    "region": "Ascalon",
    "materialName": "Rich Silver",
    "waypointName": "Blasted Moors Waypoint",
    "waypointCode": "[&BNoAAAA=]",
    "optimal": 503,
    "items": [
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 54,
    "image": "Fireheart Rise - Perma Butternut Squash.jpg",
    "area": "Apostate Wastes",
    "zone": "Fireheart Rise",
    "region": "Ascalon",
    "materialName": "Butternut Squash",
    "waypointName": "Apostate Waypoint",
    "waypointCode": "[&BB0CAAA=]",
    "optimal": 601,
    "items": [
      {
        "id": 12511,
        "quantity": 8
      }
    ]
  },
  {
    "id": 56,
    "image": "Fireheart Rise - Perma Rich Platinum 2.jpg",
    "area": "Rebel's Seclusion",
    "zone": "Fireheart Rise",
    "region": "Ascalon",
    "materialName": "Rich Platinum",
    "waypointName": "Breaktooth's Waypoint",
    "waypointCode": "[&BBoCAAA=]",
    "optimal": 602,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 57,
    "image": "Fireheart Rise - Perma Rich Mithril.jpg",
    "area": "The Baelfire",
    "zone": "Fireheart Rise",
    "region": "Ascalon",
    "materialName": "Rich Mithril",
    "waypointName": "The Citadel of Flame Waypoint",
    "waypointCode": "[&BEAFAAA=]",
    "optimal": 603,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 55,
    "image": "Fireheart Rise - Perma Rich Platinum.jpg",
    "area": "Onager Bivouac",
    "zone": "Fireheart Rise",
    "region": "Ascalon",
    "materialName": "Rich Platinum",
    "waypointName": "Rustbowl Waypoint",
    "waypointCode": "[&BB4CAAA=]",
    "optimal": 604,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 63,
    "image": "Frostgorge Sound - Perma Butternut Squash.jpg",
    "area": "Arundon Vale",
    "zone": "Frostgorge Sound",
    "region": "Shiverpeak Mountains",
    "materialName": "Butternut Squash",
    "waypointName": "Arundon Waypoint",
    "waypointCode": "[&BHgCAAA=]",
    "optimal": 701,
    "items": [
      {
        "id": 12511,
        "quantity": 8
      }
    ]
  },
  {
    "id": 64,
    "image": "Frostgorge Sound - Perma Rich Mithril.jpg",
    "area": "Grimstone Mol",
    "zone": "Frostgorge Sound",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Mithril",
    "waypointName": "Slough of Despond Waypoint",
    "waypointCode": "[&BHwCAAA=]",
    "optimal": 702,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 65,
    "image": "Frostgorge Sound - Perma Rich Mithril 2.jpg",
    "area": "Bore Lynch",
    "zone": "Frostgorge Sound",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Mithril",
    "waypointName": "Groznev Waypoint",
    "waypointCode": "[&BHkCAAA=]",
    "optimal": 703,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 80,
    "image": "Bitterfrost Frontier - Permanent Mithril.jpg",
    "area": "Blizzard Basin",
    "zone": "Bitterfrost Frontier",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Mithril",
    "waypointName": "Koda's Welcome Waypoint",
    "waypointCode": "[&BIEJAAA=]",
    "optimal": 801,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 22,
    "image": "Snowden Drifts - Perma Rich Iron.jpg",
    "area": "Reaver's Dale",
    "zone": "Snowden Drifts",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Iron",
    "waypointName": "Snowhawk Landing Waypoint",
    "waypointCode": "[&BL8AAAA=]",
    "optimal": 901,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 21,
    "image": "Snowden Drifts - Perma Strawberry Patch.jpg",
    "area": "Griffonfall",
    "zone": "Snowden Drifts",
    "region": "Shiverpeak Mountains",
    "materialName": "Strawberries",
    "waypointName": "Reaver's Waypoint",
    "waypointCode": "[&BMAAAAA=]",
    "optimal": 902,
    "items": [
      {
        "id": 12253,
        "quantity": 8
      }
    ]
  },
  {
    "id": 23,
    "image": "Snowden Drifts - Perma Rich Silver.jpg",
    "area": "Valslake",
    "zone": "Snowden Drifts",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Silver",
    "waypointName": "Valslake Waypoint",
    "waypointCode": "[&BMADAAA=]",
    "optimal": 903,
    "items": [
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 28,
    "image": "Lornar's Pass - Perma Rich Iron.jpg",
    "area": "Icedevil's Needle",
    "zone": "Lornar's Pass",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Iron",
    "waypointName": "Icedevil's Waypoint",
    "waypointCode": "[&BFEGAAA=]",
    "optimal": 1001,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 29,
    "image": "Lornar's Pass - Perma Rich Silver.jpg",
    "area": "Durmand Priory",
    "zone": "Lornar's Pass",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Silver",
    "waypointName": "Durmand Priory Waypoint",
    "waypointCode": "[&BOkAAAA=]",
    "optimal": 1002,
    "items": [
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 27,
    "image": "Lornar's Pass - Perma Grapes.jpg",
    "area": "False Lake",
    "zone": "Lornar's Pass",
    "region": "Shiverpeak Mountains",
    "materialName": "Grapes",
    "waypointName": "Demon's Maw Waypoint",
    "waypointCode": "[&BOYAAAA=]",
    "optimal": 1003,
    "items": [
      {
        "id": 12341,
        "quantity": 8
      }
    ]
  },
  {
    "id": 30,
    "image": "Lornar's Pass - Perma Rich Gold.jpg",
    "area": "Demon's Maw",
    "zone": "Lornar's Pass",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Gold",
    "waypointName": "Demon's Maw Waypoint",
    "waypointCode": "[&BOYAAAA=]",
    "optimal": 1004,
    "items": [
      {
        "id": 19698,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 42,
    "image": "Dredgehaunt Cliffs - Perma Rich Iron.jpg",
    "area": "Kolkorensburg",
    "zone": "Dredgehaunt Cliffs",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Iron",
    "waypointName": "Wyrmblood Waypoint",
    "waypointCode": "[&BGUCAAA=]",
    "optimal": 1101,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 41,
    "image": "Dredgehaunt Cliffs - Perma Cabbage.jpg",
    "area": "The Wide Expanse",
    "zone": "Dredgehaunt Cliffs",
    "region": "Shiverpeak Mountains",
    "materialName": "Cabbage",
    "waypointName": "Wide Expanse Waypoint",
    "waypointCode": "[&BF8CAAA=]",
    "optimal": 1102,
    "items": [
      {
        "id": 12332,
        "quantity": 8
      }
    ]
  },
  {
    "id": 43,
    "image": "Dredgehaunt Cliffs - Perma Rich Gold.jpg",
    "area": "Kapellenburg",
    "zone": "Dredgehaunt Cliffs",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Gold",
    "waypointName": "Steelbrachen Waypoint",
    "waypointCode": "[&BFsCAAA=]",
    "optimal": 1103,
    "items": [
      {
        "id": 19698,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 50,
    "image": "Timberline Falls - Perma Rich Platinum.jpg",
    "area": "Gentle River",
    "zone": "Timberline Falls",
    "region": "Shiverpeak Mountains",
    "materialName": "Rich Platinum",
    "waypointName": "Thistlereed Waypoint",
    "waypointCode": "[&BFECAAA=]",
    "optimal": 1201,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 49,
    "image": "Timberline Falls - Perma Cauliflower.jpg",
    "area": "Gentle River",
    "zone": "Timberline Falls",
    "region": "Shiverpeak Mountains",
    "materialName": "Cauliflower",
    "waypointName": "Thistlereed Waypoint",
    "waypointCode": "[&BFECAAA=]",
    "optimal": 1202,
    "items": [
      {
        "id": 12532,
        "quantity": 8
      }
    ]
  },
  {
    "id": 58,
    "image": "Mount Maelstrom - Perma Artichokes.jpg",
    "area": "Treacherous Depths",
    "zone": "Mount Maelstrom",
    "region": "Tarnished Coast",
    "materialName": "Artichoke",
    "waypointName": "Oxbow Isle Waypoint",
    "waypointCode": "[&BNECAAA=]",
    "optimal": 1301,
    "items": [
      {
        "id": 12512,
        "quantity": 8
      }
    ]
  },
  {
    "id": 59,
    "image": "Mount Maelstrom - Perma Rich Platinum.jpg",
    "area": "Sunken Droknah",
    "zone": "Mount Maelstrom",
    "region": "Tarnished Coast",
    "materialName": "Rich Platinum",
    "waypointName": "Old Sledge Site Waypoint",
    "waypointCode": "[&BNQCAAA=]",
    "optimal": 1302,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 60,
    "image": "Mount Maelstrom - Perma Rich Platinum 2.jpg",
    "area": "Criterion Canyon",
    "zone": "Mount Maelstrom",
    "region": "Tarnished Coast",
    "materialName": "Rich Platinum",
    "waypointName": "Criterion Waypoint",
    "waypointCode": "[&BMkCAAA=]",
    "optimal": 1303,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 61,
    "image": "Straits of Devastation - Perma Artichokes.jpg",
    "area": "Bramble Pass",
    "zone": "Straits of Devastation",
    "region": "Ruins of Orr",
    "materialName": "Artichoke",
    "waypointName": "Plinth Timberland Waypoint",
    "waypointCode": "[&BFgGAAA=]",
    "optimal": 1401,
    "items": [
      {
        "id": 12512,
        "quantity": 8
      }
    ]
  },
  {
    "id": 62,
    "image": "Straits of Devastation - Perma Rich Mithril.jpg",
    "area": "Straits of Malediction",
    "zone": "Straits of Devastation",
    "region": "Ruins of Orr",
    "materialName": "Rich Mithril",
    "waypointName": "Dire Shoal Waypoint",
    "waypointCode": "[&BOUGAAA=]",
    "optimal": 1402,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 75,
    "image": "Straits of Devastation - Perma Elder Wood.jpg",
    "area": "Waywarde Way",
    "zone": "Straits of Devastation",
    "region": "Ruins of Orr",
    "materialName": "Elder Wood",
    "waypointName": "Waywarde Waypoint",
    "waypointCode": "[&BPgCAAA=]",
    "optimal": 1403,
    "items": [
      {
        "id": 19722,
        "quantity": 12
      }
    ]
  },
  {
    "id": 71,
    "image": "Machor's Leap - Perma Elder Wood.jpg",
    "area": "Theater of Delight",
    "zone": "Malchor's Leap",
    "region": "Ruins of Orr",
    "materialName": "Elder Wood",
    "waypointName": "Pagga's Waypoint",
    "waypointCode": "[&BKYCAAA=]",
    "optimal": 1501,
    "items": [
      {
        "id": 19722,
        "quantity": 15
      }
    ]
  },
  {
    "id": 66,
    "image": "Malchor's Leap - Perma Rich Mithril.jpg",
    "area": "Midwater Hollows",
    "zone": "Malchor's Leap",
    "region": "Ruins of Orr",
    "materialName": "Rich Mithril",
    "waypointName": "Waste Hollows Waypoint",
    "waypointCode": "[&BKgCAAA=]",
    "optimal": 1502,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 67,
    "image": "Malchor's Leap - Perma Rich Mithril 2.jpg",
    "area": "Jinx Isle",
    "zone": "Malchor's Leap",
    "region": "Ruins of Orr",
    "materialName": "Rich Mithril",
    "waypointName": "Lights Waypoint",
    "waypointCode": "[&BLICAAA=]",
    "optimal": 1503,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 68,
    "image": "Cursed Shore - Perma Rich Mithril.jpg",
    "area": "The Shipyard",
    "zone": "Cursed Shore",
    "region": "Ruins of Orr",
    "materialName": "Rich Mithril",
    "waypointName": "Meddler's Waypoint",
    "waypointCode": "[&BB4DAAA=]",
    "optimal": 1601,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 69,
    "image": "Cursed Shore - Perma Rich Mithril 2.jpg",
    "area": "Mausollus Sea",
    "zone": "Cursed Shore",
    "region": "Ruins of Orr",
    "materialName": "Rich Mithril",
    "waypointName": "Shipwreck Rock Waypoint",
    "waypointCode": "[&BOQGAAA=]",
    "optimal": 1602,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 52,
    "image": "Sparkfly Fen - Perma Rich Platinum.jpg",
    "area": "Shimmerstone Cave",
    "zone": "Sparkfly Fen",
    "region": "Tarnished Coast",
    "materialName": "Rich Platinum",
    "waypointName": "Flamefrog Waypoint",
    "waypointCode": "[&BMwBAAA=]",
    "optimal": 1701,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 51,
    "image": "Sparkfly Fen - Perma Cauliflower.jpg",
    "area": "Orvanic Shore",
    "zone": "Sparkfly Fen",
    "region": "Tarnished Coast",
    "materialName": "Cauliflower",
    "waypointName": "Ocean's Gulley Waypoint",
    "waypointCode": "[&BMkBAAA=]",
    "optimal": 1702,
    "items": [
      {
        "id": 12532,
        "quantity": 8
      }
    ]
  },
  {
    "id": 53,
    "image": "Sparkfly Fen - Perma Rich Platinum 2.jpg",
    "area": "Karinn's Passage",
    "zone": "Sparkfly Fen",
    "region": "Tarnished Coast",
    "materialName": "Rich Platinum",
    "waypointName": "Ocean's Gulley Waypoint",
    "waypointCode": "[&BMkBAAA=]",
    "optimal": 1703,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 45,
    "image": "Bloodtide Coast - Perma Rich Platinum.jpg",
    "area": "Mole's Head",
    "zone": "Bloodtide Coast",
    "region": "Kryta",
    "materialName": "Rich Platinum",
    "waypointName": "Mournful Waypoint",
    "waypointCode": "[&BK0BAAA=]",
    "optimal": 1801,
    "items": [
      {
        "id": 19702,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 44,
    "image": "Bloodtide Coast - Perma Sugar Pumpkins.jpg",
    "area": "Risewild Hills",
    "zone": "Bloodtide Coast",
    "region": "Kryta",
    "materialName": "Sugar Pumpkins",
    "waypointName": "Remanda Waypoint",
    "waypointCode": "[&BKcBAAA=]",
    "optimal": 1802,
    "items": [
      {
        "id": 12538,
        "quantity": 8
      }
    ]
  },
  {
    "id": 25,
    "image": "Gendarran Fields - Perma Rich Iron.jpg",
    "area": "Overlook Caverns",
    "zone": "Gendarran Fields",
    "region": "Kryta",
    "materialName": "Rich Iron",
    "waypointName": "Icegate Waypoint",
    "waypointCode": "[&BJMBAAA=]",
    "optimal": 1901,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 26,
    "image": "Gendarran Fields - Perma Rich Silver.jpg",
    "area": "Icegate Gorge",
    "zone": "Gendarran Fields",
    "region": "Kryta",
    "materialName": "Rich Silver",
    "waypointName": "Icegate Waypoint",
    "waypointCode": "[&BJMBAAA=]",
    "optimal": 1902,
    "items": [
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 24,
    "image": "Gendarren Fields - Perma Spinach.jpg",
    "area": "Provernic Crypt",
    "zone": "Gendarran Fields",
    "region": "Kryta",
    "materialName": "Spinach",
    "waypointName": "Provern Shore Waypoint",
    "waypointCode": "[&BOQAAAA=]",
    "optimal": 1903,
    "items": [
      {
        "id": 12241,
        "quantity": 8
      }
    ]
  },
  {
    "id": 37,
    "image": "Harathi Hinterlands - Perma Rich Gold.jpg",
    "area": "Modniir Gorge",
    "zone": "Harathi Hinterlands",
    "region": "Kryta",
    "materialName": "Rich Gold",
    "waypointName": "Cloven Hoof Waypoint",
    "waypointCode": "[&BLEAAAA=]",
    "optimal": 2001,
    "items": [
      {
        "id": 19698,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 36,
    "image": "Harathi Hinterlands - Perma Rich Iron.jpg",
    "area": "Ruins of Holy Demetra",
    "zone": "Harathi Hinterlands",
    "region": "Kryta",
    "materialName": "Rich Iron",
    "waypointName": "Demetra Waypoint",
    "waypointCode": "[&BKsAAAA=]",
    "optimal": 2002,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 35,
    "image": "Harathi Hinterlands - Perma Cabbage.jpg",
    "area": "Ruins of Holy Demetra",
    "zone": "Harathi Hinterlands",
    "region": "Kryta",
    "materialName": "Cabbage",
    "waypointName": "Demetra Waypoint",
    "waypointCode": "[&BKsAAAA=]",
    "optimal": 2003,
    "items": [
      {
        "id": 12332,
        "quantity": 8
      }
    ]
  },
  {
    "id": 4,
    "image": "Queensdale - Perma Lettuce.jpg",
    "area": "Beetletun Farms",
    "zone": "Queensdale",
    "region": "Kryta",
    "materialName": "Lettuce",
    "waypointName": "Beetletun Waypoint",
    "waypointCode": "[&BPoAAAA=]",
    "optimal": 2101,
    "items": [
      {
        "id": 12238,
        "quantity": 8
      }
    ]
  },
  {
    "id": 5,
    "image": "Queensdale - Perma Rich Copper.jpg",
    "area": "Phinney Ridge",
    "zone": "Queensdale",
    "region": "Kryta",
    "materialName": "Rich Copper",
    "waypointName": "Phinney Waypoint",
    "waypointCode": "[&BPMAAAA=]",
    "optimal": 2102,
    "items": [
      {
        "id": 19697,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 6,
    "image": "Queensdale - Perma Rich Copper 2.jpg",
    "area": "Taminn Foothills",
    "zone": "Queensdale",
    "region": "Kryta",
    "materialName": "Rich Copper",
    "waypointName": "Godslost Waypoint",
    "waypointCode": "[&BPwAAAA=]",
    "optimal": 2103,
    "items": [
      {
        "id": 19697,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 17,
    "image": "Kessex Hills - Perma Rich Iron or Silver 3.jpg",
    "area": "Overlord's Greatcamp",
    "zone": "Kessex Hills",
    "region": "Kryta",
    "materialName": "Rich Iron or Silver",
    "waypointName": "Overlord's Waypoint",
    "waypointCode": "[&BAQAAAA=]",
    "optimal": 2201,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      },
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 14,
    "image": "Kessex Hills - Perma Strawberry Patch.jpg",
    "area": "Wizard's Fief",
    "zone": "Kessex Hills",
    "region": "Kryta",
    "materialName": "Strawberries",
    "waypointName": "Cereboth Waypoint",
    "waypointCode": "[&BBIAAAA=]",
    "optimal": 2202,
    "items": [
      {
        "id": 12253,
        "quantity": 8
      }
    ]
  },
  {
    "id": 15,
    "image": "Kessex Hills - Perma Rich Iron or Silver.jpg",
    "area": "Cereboth Canyon",
    "zone": "Kessex Hills",
    "region": "Kryta",
    "materialName": "Rich Iron or Silver",
    "waypointName": "Cereboth Waypoint",
    "waypointCode": "[&BBIAAAA=]",
    "optimal": 2203,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      },
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 16,
    "image": "Kessex Hills - Perma Rich Iron or Silver 2.jpg",
    "area": "Cereeboth Canyon",
    "zone": "Kessex Hills",
    "region": "Kryta",
    "materialName": "Rich Iron or Silver",
    "waypointName": "Cereboth Waypoint",
    "waypointCode": "[&BBIAAAA=]",
    "optimal": 2204,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      },
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 9,
    "image": "Caledon Forest - Perma Rich Copper 2.jpg",
    "area": "Ruins of the Unseen",
    "zone": "Caledon Forest",
    "region": "Tarnished Coast",
    "materialName": "Rich Copper",
    "waypointName": "Caledon Haven Waypoint",
    "waypointCode": "[&BDwBAAA=]",
    "optimal": 2301,
    "items": [
      {
        "id": 19697,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 7,
    "image": "Caledon Forest - Perma Lettuce.jpg",
    "area": "The Rowanwoods",
    "zone": "Caledon Forest",
    "region": "Tarnished Coast",
    "materialName": "Lettuce",
    "waypointName": "Kraitbane Haven Waypoint",
    "waypointCode": "[&BEABAAA=]",
    "optimal": 2302,
    "items": [
      {
        "id": 12238,
        "quantity": 8
      }
    ]
  },
  {
    "id": 8,
    "image": "Caledon Forest - Perma Rich Copper.jpg",
    "area": "Wychmire Swamp",
    "zone": "Caledon Forest",
    "region": "Tarnished Coast",
    "materialName": "Rich Copper",
    "waypointName": "Wychmire Waypoint",
    "waypointCode": "[&BEEBAAA=]",
    "optimal": 2303,
    "items": [
      {
        "id": 19697,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 10,
    "image": "Metrica Province - Perma Potatoes.jpg",
    "area": "Akk Wilds",
    "zone": "Metrica Province",
    "region": "Tarnished Coast",
    "materialName": "Potatoes",
    "waypointName": "Akk Wilds Waypoint",
    "waypointCode": "[&BEIAAAA=]",
    "optimal": 2401,
    "items": [
      {
        "id": 12135,
        "quantity": 8
      }
    ]
  },
  {
    "id": 18,
    "image": "Brisban Wildlands - Perma Spinach.jpg",
    "area": "Karston Chambers",
    "zone": "Brisban Wildlands",
    "region": "Tarnished Coast",
    "materialName": "Spinach",
    "waypointName": "Watchful Source Waypoint",
    "waypointCode": "[&BFwAAAA=]",
    "optimal": 2501,
    "items": [
      {
        "id": 12241,
        "quantity": 8
      }
    ]
  },
  {
    "id": 19,
    "image": "Brisban Wildlands - Perma Rich Iron.jpg",
    "area": "The Gallowfields",
    "zone": "Brisban Wildlands",
    "region": "Tarnished Coast",
    "materialName": "Rich Iron",
    "waypointName": "Gallowfields Waypoint",
    "waypointCode": "[&BGMAAAA=]",
    "optimal": 2502,
    "items": [
      {
        "id": 19699,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 20,
    "image": "Brisban Wildlands - Perma Rich Silver.jpg",
    "area": "Lionshead Outcrops",
    "zone": "Brisban Wildlands",
    "region": "Tarnished Coast",
    "materialName": "Rich Silver",
    "waypointName": "Gallowfields Waypoint",
    "waypointCode": "[&BGMAAAA=]",
    "optimal": 2503,
    "items": [
      {
        "id": 19703,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 98,
    "image": "16 - Clams - Brisban Wildlands - Mrot Boru Waypoint.png",
    "area": "Venlin Vale",
    "zone": "Brisban Wildlands",
    "region": "Tarnished Coast",
    "materialName": "Clams",
    "waypointName": "Mrot Boru Waypoint",
    "waypointCode": "[&BHUAAAA=]",
    "optimal": 2504,
    "items": [
      {
        "id": 12327,
        "quantity": 7
      }
    ]
  },
  {
    "id": 74,
    "image": "Southsun Cove - Permanent Orichalcum.jpg",
    "area": "Bakestone Cavern",
    "zone": "Southsun Cove",
    "region": "Kryta",
    "materialName": "Orichalcum",
    "waypointName": "Owain's Refuge Waypoint",
    "waypointCode": "[&BNgGAAA=]",
    "optimal": 2601,
    "items": [
      {
        "id": 19701,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 83,
    "image": "1 - Mithril - Southsun Cove - Pearl Islet Waypoint.png",
    "area": "Dappled Shores",
    "zone": "Southsun Cove",
    "region": "Kryta",
    "materialName": "Rich Mithril",
    "waypointName": "Pearl Islet Waypoint",
    "waypointCode": "[&BNUGAAA=]",
    "optimal": 2602,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 95,
    "image": "13 - Passiflora - Southsun Cove - Pearl Islet Waypoint.png",
    "area": "Dappled Shores",
    "zone": "Southsun Cove",
    "region": "Kryta",
    "materialName": "Passiflora",
    "waypointName": "Pearl Islet Waypoint",
    "waypointCode": "[&BNUGAAA=]",
    "optimal": 2603,
    "items": [
      {
        "id": 36731,
        "quantity": 8
      }
    ]
  },
  {
    "id": 70,
    "image": "Dry Top - Perma Carrot Lettuce Cabbage & Cactus.jpg",
    "area": "Uplands Oasis",
    "zone": "Dry Top",
    "region": "Maguuma Wastes",
    "materialName": "Carrot, Lettuce, Cabbage & Cactus",
    "waypointName": "Vine Bridge Waypoint",
    "waypointCode": "[&BIYHAAA=]",
    "optimal": 2701,
    "items": [
      {
        "id": 12134,
        "quantity": 4
      },
      {
        "id": 12238,
        "quantity": 4
      },
      {
        "id": 12332,
        "quantity": 2
      },
      {
        "id": 66524,
        "quantity": 4
      }
    ]
  },
  {
    "id": 84,
    "image": "2 - Quartz - Dry Top - Prosperity Waypoint.png",
    "area": "Prospect Valley",
    "zone": "Dry Top",
    "region": "Maguuma Wastes",
    "materialName": "Quartz",
    "waypointName": "Prosperity Waypoint",
    "waypointCode": "[&BHoHAAA=]",
    "optimal": 2702,
    "items": [
      {
        "id": 43773,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 85,
    "image": "3 - Quartz - Dry Top - Prosperity Waypoint.png",
    "area": "Prospect Valley",
    "zone": "Dry Top",
    "region": "Maguuma Wastes",
    "materialName": "Quartz",
    "waypointName": "Prosperity Waypoint",
    "waypointCode": "[&BHoHAAA=]",
    "optimal": 2703,
    "items": [
      {
        "id": 43773,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 76,
    "image": "Verdant Brink - Perma Flax.jpg",
    "area": "Jaka Itzel",
    "zone": "Verdant Brink",
    "region": "Heart of Maguuma",
    "materialName": "Flax",
    "waypointName": "Jaka Itzel Waypoint",
    "waypointCode": "[&BOAHAAA=]",
    "optimal": 2801,
    "videoGuide": "Y1c1EebeOkA",
    "items": [
      {
        "id": 74090,
        "quantity": 12
      }
    ]
  },
  {
    "id": 97,
    "image": "15 - Mussels - Verdant Brink - Shipwreck Peak Waypoint.png",
    "area": "Maguuma's Breach",
    "zone": "Verdant Brink",
    "region": "Heart of Maguuma",
    "materialName": "Mussels",
    "waypointName": "Shipwreck Peak Waypoint",
    "waypointCode": "[&BN4HAAA=]",
    "optimal": 2802,
    "items": [
      {
        "id": 74266,
        "quantity": 11
      }
    ]
  },
  {
    "id": 73,
    "image": "Tangled Depths - Perma Flax.jpg",
    "area": "The Great Tree",
    "zone": "Tangled Depths",
    "region": "Heart of Maguuma",
    "materialName": "Flax",
    "waypointName": "Order of Whispers Camp Waypoint",
    "waypointCode": "[&BAUIAAA=]",
    "optimal": 2901,
    "videoGuide": "LdQBK79j34Q",
    "items": [
      {
        "id": 74090,
        "quantity": 12
      }
    ]
  },
  {
    "id": 82,
    "image": "Draconis Mons - Flax.jpg",
    "area": "Savage Rise",
    "zone": "Draconis Mons",
    "region": "Ring of Fire",
    "materialName": "Flax",
    "waypointName": "Heathen's Hold Waypoint",
    "waypointCode": "[&BM0JAAA=]",
    "optimal": 3001,
    "videoGuide": "Ef72rmRaQAk",
    "items": [
      {
        "id": 74090,
        "quantity": 15
      }
    ]
  },
  {
    "id": 81,
    "image": "Ember Bay - Seaweed.jpg",
    "area": "Sulfurous Deep",
    "zone": "Ember Bay",
    "region": "Heart of Maguuma",
    "materialName": "Seaweed",
    "waypointName": "Promontory Waypoint",
    "waypointCode": "[&BF8JAAA=]",
    "optimal": 3101,
    "items": [
      {
        "id": 12509,
        "quantity": 13
      }
    ]
  },
  {
    "id": 86,
    "image": "4 - Orichalcum - Auric Basin - Eastwatch Waypoint.png",
    "area": "Eastwatch Bluff",
    "zone": "Auric Basin",
    "region": "Heart of Maguuma",
    "materialName": "Orichalcum",
    "waypointName": "Eastwatch Waypoint",
    "waypointCode": "[&BGwIAAA=]",
    "optimal": 3201,
    "items": [
      {
        "id": 19701,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 87,
    "image": "5 - Orichalcum - Desert Highlands - Highjump Ranch Waypoint.png",
    "area": "Stampede Uplands",
    "zone": "Desert Highlands",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Highjump Ranch Waypoint",
    "waypointCode": "[&BJ0KAAA=]",
    "optimal": 3301,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 88,
    "image": "6 - Orichalcum - Desert Highlands - Brightwater Waypoint.png",
    "area": "Brightwater Inlet",
    "zone": "Desert Highlands",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Brightwater Waypoint",
    "waypointCode": "[&BJEKAAA=]",
    "optimal": 3302,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 89,
    "image": "7 - Strawberry - Desert Highlands - Brightwater Waypoint.png",
    "area": "Brightwater Inlet",
    "zone": "Desert Highlands",
    "region": "Crystal Desert",
    "materialName": "Strawberries",
    "waypointName": "Brightwater Waypoint",
    "waypointCode": "[&BJEKAAA=]",
    "optimal": 3303,
    "items": [
      {
        "id": 12253,
        "quantity": 6
      }
    ]
  },
  {
    "id": 92,
    "image": "10 - Clams - Desert Highlands - Brightwater Waypoint.png",
    "area": "Transcendent Bay",
    "zone": "Desert Highlands",
    "region": "Crystal Desert",
    "materialName": "Clams",
    "waypointName": "Brightwater Waypoint",
    "waypointCode": "[&BJEKAAA=]",
    "optimal": 3304,
    "items": [
      {
        "id": 12327,
        "quantity": 7
      }
    ]
  },
  {
    "id": 90,
    "image": "8 - Clams - Crystal Oasis - Amnoon Waypoint.png",
    "area": "Bay of Elon",
    "zone": "Crystal Oasis",
    "region": "Crystal Desert",
    "materialName": "Clams",
    "waypointName": "Amnoon Waypoint",
    "waypointCode": "[&BLsKAAA=]",
    "optimal": 3401,
    "items": [
      {
        "id": 12327,
        "quantity": 7
      }
    ]
  },
  {
    "id": 91,
    "image": "9 - Orichalcum - Crystal Oasis - Destiny's Gorge Waypoint.png",
    "area": "Glint's Legacy",
    "zone": "Crystal Oasis",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Destiny's Gorge Waypoint",
    "waypointCode": "[&BJMKAAA=]",
    "optimal": 3402,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 96,
    "image": "14 - Lentils - Crystal Oasis - Temple of Kormir Waypoint.png",
    "area": "Elona Reach",
    "zone": "Crystal Oasis",
    "region": "Crystal Desert",
    "materialName": "Lentils",
    "waypointName": "Temple of Kormir Waypoint",
    "waypointCode": "[&BEAKAAA=]",
    "optimal": 3403,
    "items": [
      {
        "id": 82866,
        "quantity": 8
      }
    ]
  },
  {
    "id": 101,
    "image": "Crystal Oasis - Perma Rich Mithril.jpg",
    "area": "Forged Foothold",
    "zone": "Crystal Oasis",
    "region": "Crystal Desert",
    "materialName": "Quartz & Rich Mithril",
    "waypointName": "Destiny's Gorge Waypoint",
    "waypointCode": "[&BJMKAAA=]",
    "optimal": 3404,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      },
      {
        "id": 43773,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 93,
    "image": "11 - Carrots - The Desolation - Bonestrand Waypoint.png",
    "area": "The Bonestrand",
    "zone": "The Desolation",
    "region": "Crystal Desert",
    "materialName": "Carrot",
    "waypointName": "Bonestrand Waypoint",
    "waypointCode": "[&BNwKAAA=]",
    "optimal": 3501,
    "items": [
      {
        "id": 12134,
        "quantity": 7
      }
    ]
  },
  {
    "id": 94,
    "image": "12 - Mixed - Sandswept Isles - Atholma Waypoint.png",
    "area": "The Ruined Paths",
    "zone": "Sandswept Isles",
    "region": "Crystal Desert",
    "materialName": "Cabbage, Artichoke, Lentils, Cluster of Desert Herbs, Desert Vegetables",
    "waypointName": "Atholma Waypoint",
    "waypointCode": "[&BEMLAAA=]",
    "optimal": 3601,
    "items": [
      {
        "id": 12512,
        "quantity": 4
      },
      {
        "id": 12332,
        "quantity": 4
      },
      {
        "id": 82866,
        "quantity": 4
      }
    ]
  },
  {
    "id": 111,
    "image": "Sandswept Isles 1.png",
    "area": "The Ruined Paths",
    "zone": "Sandswept Isles",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Atholma Waypoint",
    "waypointCode": "[&BEMLAAA=]",
    "optimal": 3601.5,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 99,
    "image": "Iron - Thunderhead Peaks.jpg",
    "area": "The Weeping Crest",
    "zone": "Thunderhead Peaks",
    "region": "Shiverpeak Mountains",
    "materialName": "Iron",
    "waypointName": "History's End Waypoint",
    "waypointCode": "[&BLsLAAA=]",
    "optimal": 3701,
    "items": [
      {
        "id": 19699,
        "quantity": 24,
        "ore": true
      }
    ]
  },
  {
    "id": 100,
    "image": "Platinum - Thunderhead Peaks.jpg",
    "area": "Hundar Pike",
    "zone": "Thunderhead Peaks",
    "region": "Shiverpeak Mountains",
    "materialName": "Platinum",
    "waypointName": "Moorage Waypoint",
    "waypointCode": "[&BLoLAAA=]",
    "optimal": 3702,
    "items": [
      {
        "id": 19702,
        "quantity": 21,
        "ore": true
      }
    ]
  },
  {
    "id": 102,
    "image": "Flax - Overlook Waypoint.png",
    "area": "Fragmented Wastes",
    "zone": "Bloodstone Fen",
    "region": "Heart of Maguuma",
    "materialName": "Flax",
    "waypointName": "Zealot's Overlook",
    "waypointCode": "[&BE4JAAA=]",
    "optimal": 3801,
    "items": [
      {
        "id": 74090,
        "quantity": 12
      }
    ]
  },
  {
    "id": 103,
    "image": "Flax - Allied Encampment Waypoint.png",
    "area": "Arkjok Farmlands",
    "zone": "Domain of Kourna",
    "region": "Crystal Desert",
    "materialName": "Flax",
    "waypointName": "Allied Encampment",
    "waypointCode": "[&BFcLAAA=]",
    "optimal": 3810,
    "items": [
      {
        "id": 74090,
        "quantity": 12
      }
    ]
  },
  {
    "id": 104,
    "image": "Flax - Reclaimed Chantry Waypoint.png",
    "area": "Jungle Anomaly",
    "zone": "Jahai Bluffs",
    "region": "Crystal Desert",
    "materialName": "Flax",
    "waypointName": "Reclaimed Chantry Waypoint",
    "waypointCode": "[&BJkLAAA=]",
    "optimal": 3820,
    "items": [
      {
        "id": 74090,
        "quantity": 12
      }
    ]
  },
  {
    "id": 105,
    "image": "Orichalcum - Sandswept Isles - Atholma Waypoint.png",
    "area": "The Ruined Paths",
    "zone": "Sandswept Isles",
    "region": "Crystal Desert",
    "materialName": "Orichalcum",
    "waypointName": "Atholma Waypoint",
    "waypointCode": "[&BEMLAAA=]",
    "optimal": 3602,
    "items": [
      {
        "id": 19701,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 106,
    "image": "Elder Wood - Ember Bay - Castaway Circus Waypoint.png",
    "area": "Osprey Pillars",
    "zone": "Ember Bay",
    "region": "Heart of Maguuma",
    "materialName": "Elder Wood",
    "waypointName": "Castaway Circus Waypoint",
    "waypointCode": "[&BHgJAAA=]",
    "optimal": 3102,
    "items": [
      {
        "id": 19722,
        "quantity": 15
      }
    ]
  },
  {
    "id": 107,
    "image": "Elder Wood - Siren's Landing - Camp Reclamation Waypoint.png",
    "area": "Merciless Shore",
    "zone": "Siren's Landing",
    "region": "Ruins of Orr",
    "materialName": "Elder Wood",
    "waypointName": "Camp Reclamation Waypoint",
    "waypointCode": "[&BO8JAAA=]",
    "optimal": 3804,
    "items": [
      {
        "id": 19722,
        "quantity": 12
      }
    ]
  },
  {
    "id": 108,
    "image": "Elder Wood - Soulkeeper's Airship Waypoint.png",
    "area": "Haunted Canyons",
    "zone": "Bloodstone Fen",
    "region": "Heart of Maguuma",
    "materialName": "Elder Wood",
    "waypointName": "Soulkeeper's Airship Waypoint",
    "waypointCode": "[&BEsJAAA=]",
    "optimal": 3802,
    "items": [
      {
        "id": 19722,
        "quantity": 14
      }
    ]
  },
  {
    "id": 109,
    "image": "The Desolation 1.png",
    "area": "Silent Vale",
    "zone": "The Desolation",
    "region": "Crystal Desert",
    "materialName": "Orichalcum",
    "waypointName": "Bonestrand Waypoint",
    "waypointCode": "[&BNwKAAA=]",
    "optimal": 4000,
    "items": [
      {
        "id": 19701,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 110,
    "image": "The Desolation 2.png",
    "area": "Silent Vale",
    "zone": "The Desolation",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Bonestrand Waypoint",
    "waypointCode": "[&BNwKAAA=]",
    "optimal": 4001,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 112,
    "image": "Vabbi 1.png",
    "area": "Kodash Bazaar",
    "zone": "Domain of Vabbi",
    "region": "Crystal Desert",
    "materialName": "Orichalcum",
    "waypointName": "Market Ruins Waypoint",
    "waypointCode": "[&BHQKAAA=]",
    "optimal": 4002,
    "items": [
      {
        "id": 19701,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 113,
    "image": "Vabbi 2.png",
    "area": "Zagonur Cliffs",
    "zone": "Domain of Vabbi",
    "region": "Crystal Desert",
    "materialName": "Orichalcum",
    "waypointName": "Market Ruins Waypoint",
    "waypointCode": "[&BHQKAAA=]",
    "optimal": 4003,
    "items": [
      {
        "id": 19701,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 114,
    "image": "Vabbi 3.png",
    "area": "Yahnur Plateau",
    "zone": "Domain of Vabbi",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Market Ruins Waypoint",
    "waypointCode": "[&BHQKAAA=]",
    "optimal": 4004,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 115,
    "image": "Vabbi 4.png",
    "area": "Yahnur Plateau",
    "zone": "Domain of Vabbi",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Market Ruins Waypoint",
    "waypointCode": "[&BHQKAAA=]",
    "optimal": 4005,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 116,
    "image": "Drizzlewood1.png",
    "area": "Legion's Alcove",
    "zone": "Drizzlewood Coast",
    "region": "Shiverpeak Mountains",
    "materialName": "Orichalcum",
    "waypointName": "Forward Camp Waypoint",
    "waypointCode": "[&BHIMAAA=]",
    "optimal": 4006,
    "items": [
      {
        "id": 19701,
        "quantity": 3,
        "ore": true
      }
    ]
  },
  {
    "id": 118,
    "image": "Domain of Kourna1.png",
    "area": "Dabiji Hollows",
    "zone": "Domain of Kourna",
    "region": "Crystal Desert",
    "materialName": "Rich Mithril, Rich Orichalcum",
    "waypointName": "Allied Encampment Waypoint",
    "waypointCode": "[&BFcLAAA=]",
    "optimal": 4007,
    "items": [
      {
        "id": 19700,
        "quantity": 10,
        "ore": true
      },
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 119,
    "image": "The Desolation2.png",
    "area": "Sand Jackal Run",
    "zone": "The Desolation",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Sand Jackal Run Waypoint",
    "waypointCode": "[&BHcKAAA=]",
    "optimal": 4008,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 120,
    "image": "The Desolation3.png",
    "area": "Lair of the Forgotten",
    "zone": "The Desolation",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Lair of the Forgotten Waypoint",
    "waypointCode": "[&BMEKAAA=]",
    "optimal": 4009,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 121,
    "image": "Vabbi 5.png",
    "area": "The Necropolis",
    "zone": "Domain of Vabbi",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Necropolis Waypoint",
    "waypointCode": "[&BEoKAAA=]",
    "optimal": 4010,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 122,
    "image": "Crystal Oasis1.png",
    "area": "Amnoon Southern Outskirts",
    "zone": "Crystal Oasis",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Amnoon Waypoint",
    "waypointCode": "[&BLsKAAA=]",
    "optimal": 4011,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 123,
    "image": "Crystal Oasis2.png",
    "area": "Diviner's Passage",
    "zone": "Crystal Oasis",
    "region": "Crystal Desert",
    "materialName": "Rich Orichalcum",
    "waypointName": "Temple of Kormir Waypoint",
    "waypointCode": "[&BEAKAAA=]",
    "optimal": 4012,
    "items": [
      {
        "id": 19701,
        "quantity": 10,
        "ore": true
      }
    ]
  },
  {
    "id": 124,
    "image": "Grothmar Valley1.png",
    "area": "Rusty Meadows",
    "zone": "Grothmar Valley",
    "region": "Ascalon",
    "materialName": "Cabbage, Lettuce, Potatoes, Strawberries, Sugar Pumpkins, Zucchini",
    "waypointName": "Blood Keep Waypoint",
    "waypointCode": "[&BBsMAAA=]",
    "optimal": 4013,
    "items": [
      {
        "id": 12332,
        "quantity": 3
      },
      {
        "id": 12238,
        "quantity": 3
      },
      {
        "id": 12135,
        "quantity": 3
      },
      {
        "id": 12253,
        "quantity": 3
      },
      {
        "id": 12538,
        "quantity": 3
      },
      {
        "id": 12330,
        "quantity": 3
      }
    ]
  },
  {
    "id": 125,
    "image": "Seitung Province1.png",
    "area": "Seitung Harbor",
    "zone": "Seitung Province",
    "region": "Cantha",
    "materialName": "Cabbage, Carrot, Flax, Thyme, Parsley, Lotus, Potatoes, Soybeans, Sugar Pumpkins, Zucchini",
    "waypointName": "Village Waypoint",
    "waypointCode": "[&BJ4MAAA=]",
    "optimal": 4014,
    "items": [
      {
        "id": 12332,
        "quantity": 3
      },
      {
        "id": 12134,
        "quantity": 3
      },
      {
        "id": 74090,
        "quantity": 5
      },
      {
        "id": 12248,
        "quantity": 1
      },
      {
        "id": 12246,
        "quantity": 1
      },
      {
        "id": 12510,
        "quantity": 9
      },
      {
        "id": 12135,
        "quantity": 4
      },
      {
        "id": 97105,
        "quantity": 3
      },
      {
        "id": 12538,
        "quantity": 4
      },
      {
        "id": 12330,
        "quantity": 4
      }
    ]
  }
];
