export type ModelLibraryCategoryId = "convenience" | "home" | "outdoor" | "tools" | "film" | "my-models";

export type ModelLibraryCategory = {
  directoryName: string;
  id: ModelLibraryCategoryId;
  label: string;
};

export type ModelLibraryItem = {
  categoryId: ModelLibraryCategoryId;
  fileName: string;
  id: string;
  name: string;
  thumbUrl?: string;
  url: string;
};

export const MODEL_LIBRARY_CATEGORIES: ModelLibraryCategory[] = [
  { id: "convenience", label: "Convenience", directoryName: "便利生活" },
  { id: "home", label: "Home Living", directoryName: "生活家居" },
  { id: "outdoor", label: "Outdoors", directoryName: "户外出行" },
  { id: "tools", label: "Tools & Accessories", directoryName: "工具配件" },
  { id: "film", label: "Film Equipment", directoryName: "影视器材" },
  { id: "my-models", label: "My Models", directoryName: "" },
];

const modelLibraryModules = import.meta.glob(
  [
    "../../../../模型库/**/*.fbx",
    "../../../../模型库/**/*.obj",
    "../../../../模型库/**/*.glb",
    "../../../../模型库/**/*.gltf",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

const convenienceThumbnailModules = import.meta.glob(
  [
    "../../../../模型库/便利生活/缩略图/*.png",
    "../../../../模型库/便利生活/缩略图/*.jpg",
    "../../../../模型库/便利生活/缩略图/*.jpeg",
    "../../../../模型库/便利生活/缩略图/*.webp",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

const homeThumbnailModules = import.meta.glob(
  [
    "../../../../模型库/生活家居/缩略图/*.png",
    "../../../../模型库/生活家居/缩略图/*.jpg",
    "../../../../模型库/生活家居/缩略图/*.jpeg",
    "../../../../模型库/生活家居/缩略图/*.webp",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

const outdoorThumbnailModules = import.meta.glob(
  [
    "../../../../模型库/户外出行/缩略图/*.png",
    "../../../../模型库/户外出行/缩略图/*.jpg",
    "../../../../模型库/户外出行/缩略图/*.jpeg",
    "../../../../模型库/户外出行/缩略图/*.webp",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

const toolsThumbnailModules = import.meta.glob(
  [
    "../../../../模型库/工具配件/缩略图/*.png",
    "../../../../模型库/工具配件/缩略图/*.jpg",
    "../../../../模型库/工具配件/缩略图/*.jpeg",
    "../../../../模型库/工具配件/缩略图/*.webp",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

const filmThumbnailModules = import.meta.glob(
  [
    "../../../../模型库/影视器材/缩略图/*.png",
    "../../../../模型库/影视器材/缩略图/*.jpg",
    "../../../../模型库/影视器材/缩略图/*.jpeg",
    "../../../../模型库/影视器材/缩略图/*.webp",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

const MODEL_LIBRARY_NAME_MAP: Record<string, string> = {
  "2_liter_low.fbx": "2L Bottle",
  "A_sign_low.fbx": "A-Frame Sign",
  "ATM_low.fbx": "ATM",
  "arcade_low.fbx": "Arcade Machine",
  "back_saw_low.fbx": "Back Saw",
  "backpack_low.fbx": "Backpack",
  "bandsaw_low.fbx": "Bandsaw",
  "basket_low.fbx": "Shopping Basket",
  "basketball_hoop_low.fbx": "Basketball Hoop",
  "bathroom_sink_low.fbx": "Bathroom Sink",
  "bathtub_low.fbx": "Bathtub",
  "bed_low.fbx": "Bed",
  "beer_bottles_low.fbx": "Beer Bottles",
  "beer_cans_low.fbx": "Beer Cans",
  "belt_sander_low.fbx": "Belt Sander",
  "big_gulper_low.fbx": "Big Drink Machine",
  "binoculars_low.fbx": "Binoculars",
  "bleach_low.fbx": "Bleach",
  "book_shelf_low.fbx": "Bookshelf",
  "bucket_low.fbx": "Bucket",
  "bunk_bed_low.fbx": "Bunk Bed",
  "bunny_low.fbx": "Bunny",
  "cabinet_low.fbx": "Cabinet",
  "cactus_low.fbx": "Cactus",
  "camper_low.fbx": "Camper Van",
  "camping_stove_low.fbx": "Camping Stove",
  "canoe_low.fbx": "Canoe",
  "canteen_low.fbx": "Canteen",
  "carton_low.fbx": "Carton",
  "cash_register_low.fbx": "Cash Register",
  "cat_low.fbx": "Cat",
  "ceiling_fan_low.fbx": "Ceiling Fan",
  "cereal_box_low.fbx": "Cereal Box",
  "chair_low.fbx": "Chair",
  "charcoal_grill_low.fbx": "Charcoal Grill",
  "cigarettes_and_lighter_low.fbx": "Cigarettes & Lighter",
  "cleaner_spray_low.fbx": "Cleaning Spray",
  "coffee_carafe_low.fbx": "Coffee Carafe",
  "coffee_cup_low.fbx": "Coffee Cup",
  "coffee_maker_low.fbx": "Coffee Maker",
  "coffee_table_low.fbx": "Coffee Table",
  "computer_low.fbx": "Computer",
  "condiment_dispenser_low.fbx": "Condiment Dispenser",
  "cooking_pot_low.fbx": "Cooking Pot",
  "cooler_low.fbx": "Cooler",
  "couch_low.fbx": "Couch",
  "credit_card_machine_low.fbx": "Card Reader",
  "crowbar_low.fbx": "Crowbar",
  "cup_dispenser_low.fbx": "Cup Dispenser",
  "deer_skull_low.fbx": "Deer Skull",
  "desk_chair_low.fbx": "Office Chair",
  "desk_lamp_low.fbx": "Desk Lamp",
  "desk_low.fbx": "Desk",
  "detergent_low.fbx": "Detergent",
  "dishwasher_low.fbx": "Dishwasher",
  "display_cooler_low.fbx": "Display Cooler",
  "door_low.fbx": "Door",
  "dresser_low.fbx": "Dresser",
  "drill_press_low.fbx": "Drill Press",
  "drink_fridge_low.fbx": "Drink Fridge",
  "dryer_low.fbx": "Dryer",
  "energy_can_low.fbx": "Energy Drink Can",
  "entertainment_system_low.fbx": "Entertainment Center",
  "fence_low.fbx": "Fence",
  "fire_low.fbx": "Campfire",
  "fish_low.fbx": "Fish",
  "fish_tank_low.fbx": "Fish Tank",
  "fishing_pole_low.fbx": "Fishing Rod",
  "flashlight_low.fbx": "Flashlight",
  "folding_chair_low.fbx": "Folding Chair",
  "foosball_table_low.fbx": "Foosball Table",
  "french_press_low.fbx": "French Press",
  "glass_soda_bottle_low.fbx": "Glass Soda Bottle",
  "grill_low.fbx": "Grill",
  "Guitar_low.fbx": "Guitar",
  "hammer_low.fbx": "Hammer",
  "hand_saw_low.fbx": "Hand Saw",
  "hatchet_low.fbx": "Hatchet",
  "hotdog_roaster_low.fbx": "Hot Dog Roaster",
  "Ice_cream_machine_low.fbx": "Ice Cream Machine",
  "Icebox_low.fbx": "Icebox",
  "Jar_low.fbx": "Glass Jar",
  "juice_bottle_low.fbx": "Juice Bottle",
  "juice_machine_low.fbx": "Juice Machine",
  "kayak_low.fbx": "Kayak",
  "ketchup_bottle_low.fbx": "Ketchup Bottle",
  "kettle_low.fbx": "Kettle",
  "kitchen_sink_low.fbx": "Kitchen Sink",
  "lantern_low.fbx": "Lantern",
  "laundry_basket_low.fbx": "Laundry Basket",
  "lighter_fluid_low.fbx": "Lighter Fluid",
  "lounge_chair_low.fbx": "Lounge Chair",
  "magazine_rack_low.fbx": "Magazine Rack",
  "mailbox_low.fbx": "Mailbox",
  "metal_canister_low.fbx": "Metal Canister",
  "microwave_low.fbx": "Microwave",
  "milk_low.fbx": "Milk Carton",
  "mixer_low.fbx": "Mixer",
  "motor_oil_low.fbx": "Motor Oil",
  "mustard_low.fbx": "Mustard Bottle",
  "nightstand_low.fbx": "Nightstand",
  "oil_additive_low.fbx": "Oil Additive",
  "open_sign_low.fbx": "Open Sign",
  "paint_can_low.fbx": "Paint Can",
  "paint_roller_low.fbx": "Paint Roller",
  "pastry_case_low.fbx": "Pastry Case",
  "picnic_table_low.fbx": "Picnic Table",
  "picture_frame_low.fbx": "Picture Frame",
  "pipe_wrench_low.fbx": "Pipe Wrench",
  "plant_low.fbx": "Potted Plant",
  "plastic_bottle_low.fbx": "Plastic Bottle",
  "plastic_water_bottle_low.fbx": "Plastic Water Bottle",
  "pliers_low.fbx": "Pliers",
  "popcicle_freezer_low.fbx": "Popsicle Freezer",
  "power_drill_low.fbx": "Power Drill",
  "pretzel_warmer_low.fbx": "Pretzel Warmer",
  "radiator_low.fbx": "Radiator",
  "record_low.fbx": "Record",
  "refrigerator_low.fbx": "Refrigerator",
  "rotisserie_chicken_low.fbx": "Rotisserie Chicken Case",
  "rubber_ducky_low.fbx": "Rubber Duck",
  "saw_horse_low.fbx": "Sawhorse",
  "scratch_awl_low.fbx": "Scratch Awl",
  "screw_drivers_low.fbx": "Screwdriver Set",
  "security_camera_low.fbx": "Security Camera",
  "shelf_1_low.fbx": "Shelf 1",
  "shelf_2_low.fbx": "Shelf 2",
  "shelf_low.fbx": "Tool Shelf",
  "shop_broom_low.fbx": "Shop Broom",
  "shop_drawer_low.fbx": "Tool Drawer",
  "shop_light_low.fbx": "Shop Light",
  "shop_vac_low.fbx": "Shop Vacuum",
  "shovel_low.fbx": "Shovel",
  "shower_low.fbx": "Shower",
  "skewers_low.fbx": "Skewers",
  "skull_n_bones_low.fbx": "Skull & Bones",
  "sledge_hammer_low.fbx": "Sledgehammer",
  "sleeping_bags_low.fbx": "Sleeping Bags",
  "slurpy_cup_low.fbx": "Slushie Cup",
  "slurpy_machine_low.fbx": "Slushie Machine",
  "small_clamp_low.fbx": "Small Clamp",
  "soap_low.fbx": "Body Wash",
  "soda_can_low.fbx": "Soda Can",
  "soda_cup_low.fbx": "Soda Cup",
  "soda_machine_low.fbx": "Soda Machine",
  "speaker_low.fbx": "Speaker",
  "spraypaint_low.fbx": "Spray Paint",
  "standing_lamp_low.fbx": "Floor Lamp",
  "stool_low.fbx": "Stool",
  "stove_low.fbx": "Stove",
  "straw_dispenser_low.fbx": "Straw Dispenser",
  "stump_low.fbx": "Tree Stump",
  "syrup_bottle_low.fbx": "Syrup Bottle",
  "table_&_chairs_low.fbx": "Table & Chairs",
  "table_clamp_low.fbx": "Table Clamp",
  "table_lamp_low.fbx": "Table Lamp",
  "tape_measure_low.fbx": "Tape Measure",
  "telescope_low.fbx": "Telescope",
  "tent_1_low.fbx": "Tent 1",
  "tent_2_low.fbx": "Tent 2",
  "tent_3_low.fbx": "Tent 3",
  "tent_4_low.fbx": "Tent 4",
  "thermus_low.fbx": "Thermos",
  "Tin_Can_low.fbx": "Tin Can",
  "tin_mug_low.fbx": "Tin Mug",
  "toilet_low.fbx": "Toilet",
  "trashcan_low.fbx": "Trash Can",
  "tree_saw_low.fbx": "Tree Saw",
  "tuna_can_low.fbx": "Tuna Can",
  "tv_low.fbx": "TV",
  "vacuum_low.fbx": "Vacuum",
  "vending_machine_low.fbx": "Vending Machine",
  "vice_low.fbx": "Bench Vise",
  "washer_low.fbx": "Washing Machine",
  "water_tank_low.fbx": "Water Tank",
  "watering_can_low.fbx": "Watering Can",
  "window_low.fbx": "Window",
  "wood_chizel_low.fbx": "Wood Chisel",
  "workbench_low.fbx": "Workbench",
  "wrench_low.fbx": "Wrench",
  // Film Equipment category (drop .glb/.gltf/.fbx files into 模型库/影视器材/).
  // Names are matched by file name; extension-agnostic entries are listed per format for convenience.
  "studio_light.glb": "Studio Light",
  "softbox.glb": "Softbox Light",
  "spotlight.glb": "Spotlight",
  "light_stand.glb": "Light Stand",
  "c_stand.glb": "C-Stand",
  "camera_tripod.glb": "Camera Tripod",
  "film_camera.glb": "Film Camera",
  "field_monitor.glb": "Field Monitor",
  "boom_mic.glb": "Boom Mic",
  "clapperboard.glb": "Clapperboard",
  "reflector.glb": "Reflector",
  "dolly_track.glb": "Dolly Track",
  "camera_dolly.glb": "Camera Dolly",
  "director_chair.glb": "Director's Chair",
  "green_screen.glb": "Green Screen",
  "cable_reel.glb": "Cable Reel",
};

const MODEL_LIBRARY_THUMB_NAME_MAP: Record<string, string> = {
  "condiment_dispenser_low.fbx": "配料分配器",
  "detergent_low.fbx": "洗调剂",
  "display_cooler_low.fbx": "展示冰柜",
};

const UPDATED_MODEL_THUMBNAIL_OVERRIDES: Record<string, string> = {
  "deer_skull_low.fbx": new URL("../../../../模型库/户外出行/缩略图/鹿头骨.png", import.meta.url).href,
  "drill_press_low.fbx": new URL("../../../../模型库/工具配件/缩略图/台钻.png", import.meta.url).href,
  "thermus_low.fbx": new URL("../../../../模型库/户外出行/缩略图/保温瓶.png", import.meta.url).href,
};

function createModelName(fileName: string) {
  const mappedName = MODEL_LIBRARY_NAME_MAP[fileName];
  if (mappedName) return mappedName;

  return fileName
    .replace(/\.(fbx|obj|glb|gltf)$/i, "")
    .replace(/_low$/i, "")
    .replace(/_/g, " ")
    .replace(/\b[a-z]/g, (match) => match.toUpperCase());
}

function createModelThumbnailName(fileName: string) {
  return MODEL_LIBRARY_THUMB_NAME_MAP[fileName] ?? createModelName(fileName);
}

export function getModelLibraryItems() {
  const categoriesByDirectory = new Map(
    MODEL_LIBRARY_CATEGORIES.map((category) => [category.directoryName, category])
  );
  const createThumbnailsByName = (thumbnailModules: Record<string, string>) =>
    new Map(
      Object.entries(thumbnailModules).map(([path, url]) => {
        const fileName = path.split("/").pop() ?? path;
        const thumbnailName = fileName.replace(/\.(png|jpe?g|webp)$/i, "");

        return [thumbnailName, url];
      })
    );
  const thumbnailsByCategoryId = new Map<ModelLibraryCategoryId, Map<string, string>>([
    ["convenience", createThumbnailsByName(convenienceThumbnailModules)],
    ["home", createThumbnailsByName(homeThumbnailModules)],
    ["outdoor", createThumbnailsByName(outdoorThumbnailModules)],
    ["tools", createThumbnailsByName(toolsThumbnailModules)],
    ["film", createThumbnailsByName(filmThumbnailModules)],
  ]);

  return Object.entries(modelLibraryModules)
    .map(([path, url]) => {
      const [, directoryName, fileName] = path.match(/模型库\/([^/]+)\/([^/]+)$/) ?? [];
      const category = categoriesByDirectory.get(directoryName);

      if (!category || !fileName) return null;
      const name = createModelName(fileName);
      const thumbUrl =
        UPDATED_MODEL_THUMBNAIL_OVERRIDES[fileName] ??
        thumbnailsByCategoryId.get(category.id)?.get(createModelThumbnailName(fileName));

      return {
        categoryId: category.id,
        fileName,
        id: `${category.id}:${fileName}`,
        name,
        url,
        ...(thumbUrl ? { thumbUrl } : {}),
      } satisfies ModelLibraryItem;
    })
    .filter((item): item is ModelLibraryItem => item !== null)
    .sort((a, b) => {
      const categoryIndexA = MODEL_LIBRARY_CATEGORIES.findIndex((category) => category.id === a.categoryId);
      const categoryIndexB = MODEL_LIBRARY_CATEGORIES.findIndex((category) => category.id === b.categoryId);

      if (categoryIndexA !== categoryIndexB) return categoryIndexA - categoryIndexB;

      return a.name.localeCompare(b.name);
    });
}
