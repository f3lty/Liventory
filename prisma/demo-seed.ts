import { PrismaClient, LocationType, PropagationMethod, TransactionType, InsightType, Severity } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_LOCATIONS = [
  { name: "Greenhouse 1", description: "Primary propagation greenhouse", type: LocationType.GREENHOUSE },
  { name: "Greenhouse 2", description: "Finished plants - retail", type: LocationType.GREENHOUSE },
  { name: "Hoop House A", description: "Overstock and hardy shrubs", type: LocationType.HOOP_HOUSE },
  { name: "Hoop House B", description: "Perennials and groundcovers", type: LocationType.HOOP_HOUSE },
  { name: "Field A", description: "B&B deciduous trees", type: LocationType.FIELD },
  { name: "Field B", description: "B&B evergreen trees", type: LocationType.FIELD },
  { name: "Shade House", description: "Shade-loving plants", type: LocationType.SHADE_HOUSE },
  { name: "Overwintering House", description: "Cold-sensitive plants", type: LocationType.OVERWINTERING },
];

const DEMO_INVENTORY = [
  // Arborvitae
  { plantName: "Green Giant Arborvitae", botanicalName: "Thuja standishii × plicata", cultivar: "Green Giant", containerSize: "3 Gal", quantityAvailable: 45, quantityReserved: 12, quantitySold: 88, location: "Field B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 8.50, retailPrice: 34.99, wholesalePrice: 18.00, category: "Evergreen Trees", lowStockThreshold: 20 },
  { plantName: "Green Giant Arborvitae", botanicalName: "Thuja standishii × plicata", cultivar: "Green Giant", containerSize: "7 Gal", quantityAvailable: 22, quantityReserved: 5, quantitySold: 41, location: "Field B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 18.00, retailPrice: 79.99, wholesalePrice: 42.00, category: "Evergreen Trees", lowStockThreshold: 15 },
  { plantName: "Emerald Green Arborvitae", botanicalName: "Thuja occidentalis", cultivar: "Smaragd", containerSize: "3 Gal", quantityAvailable: 67, quantityReserved: 8, quantitySold: 124, location: "Field B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 7.00, retailPrice: 29.99, wholesalePrice: 15.00, category: "Evergreen Trees", lowStockThreshold: 25 },
  { plantName: "Emerald Green Arborvitae", botanicalName: "Thuja occidentalis", cultivar: "Smaragd", containerSize: "5 Gal", quantityAvailable: 18, quantityReserved: 3, quantitySold: 56, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 12.00, retailPrice: 49.99, wholesalePrice: 26.00, category: "Evergreen Trees", lowStockThreshold: 15 },

  // Hydrangeas
  { plantName: "Hydrangea Limelight", botanicalName: "Hydrangea paniculata", cultivar: "Limelight", containerSize: "3 Gal", quantityAvailable: 8, quantityReserved: 4, quantitySold: 92, location: "Greenhouse 2", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 9.00, retailPrice: 39.99, wholesalePrice: 22.00, category: "Flowering Shrubs", lowStockThreshold: 20, notes: "Best seller - needs propagation soon" },
  { plantName: "Hydrangea Limelight Prime", botanicalName: "Hydrangea paniculata", cultivar: "Limelight Prime", containerSize: "3 Gal", quantityAvailable: 14, quantityReserved: 2, quantitySold: 38, location: "Greenhouse 2", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 10.00, retailPrice: 44.99, wholesalePrice: 24.00, category: "Flowering Shrubs", lowStockThreshold: 15 },
  { plantName: "Hydrangea Incrediball", botanicalName: "Hydrangea arborescens", cultivar: "Incrediball", containerSize: "3 Gal", quantityAvailable: 31, quantityReserved: 6, quantitySold: 67, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 8.50, retailPrice: 36.99, wholesalePrice: 20.00, category: "Flowering Shrubs", lowStockThreshold: 15 },
  { plantName: "Hydrangea Annabelle", botanicalName: "Hydrangea arborescens", cultivar: "Annabelle", containerSize: "3 Gal", quantityAvailable: 42, quantityReserved: 0, quantitySold: 89, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 7.00, retailPrice: 32.99, wholesalePrice: 17.00, category: "Flowering Shrubs", lowStockThreshold: 15 },
  { plantName: "Endless Summer Hydrangea", botanicalName: "Hydrangea macrophylla", cultivar: "Endless Summer", containerSize: "3 Gal", quantityAvailable: 25, quantityReserved: 8, quantitySold: 73, location: "Greenhouse 2", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 9.50, retailPrice: 42.99, wholesalePrice: 23.00, category: "Flowering Shrubs", lowStockThreshold: 15 },

  // Boxwoods
  { plantName: "Boxwood Green Velvet", botanicalName: "Buxus", cultivar: "Green Velvet", containerSize: "2 Gal", quantityAvailable: 5, quantityReserved: 2, quantitySold: 158, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 6.00, retailPrice: 24.99, wholesalePrice: 13.00, category: "Broadleaf Evergreens", lowStockThreshold: 30, notes: "Critical low stock" },
  { plantName: "Boxwood Green Mountain", botanicalName: "Buxus", cultivar: "Green Mountain", containerSize: "2 Gal", quantityAvailable: 38, quantityReserved: 0, quantitySold: 112, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 6.50, retailPrice: 27.99, wholesalePrice: 14.00, category: "Broadleaf Evergreens", lowStockThreshold: 25 },
  { plantName: "Boxwood Sprinter", botanicalName: "Buxus sempervirens", cultivar: "Sprinter", containerSize: "3 Gal", quantityAvailable: 22, quantityReserved: 5, quantitySold: 44, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 9.00, retailPrice: 37.99, wholesalePrice: 20.00, category: "Broadleaf Evergreens", lowStockThreshold: 15 },

  // Japanese Maples
  { plantName: "Japanese Maple Bloodgood", botanicalName: "Acer palmatum", cultivar: "Bloodgood", containerSize: "5 Gal", quantityAvailable: 16, quantityReserved: 4, quantitySold: 28, location: "Shade House", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 28.00, retailPrice: 99.99, wholesalePrice: 55.00, category: "Deciduous Trees", lowStockThreshold: 10 },
  { plantName: "Japanese Maple Crimson Queen", botanicalName: "Acer palmatum dissectum", cultivar: "Crimson Queen", containerSize: "5 Gal", quantityAvailable: 9, quantityReserved: 2, quantitySold: 19, location: "Shade House", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 32.00, retailPrice: 119.99, wholesalePrice: 65.00, category: "Deciduous Trees", lowStockThreshold: 8 },
  { plantName: "Japanese Maple Emperor 1", botanicalName: "Acer palmatum", cultivar: "Emperor 1", containerSize: "7 Gal", quantityAvailable: 6, quantityReserved: 1, quantitySold: 12, location: "Shade House", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 42.00, retailPrice: 149.99, wholesalePrice: 80.00, category: "Deciduous Trees", lowStockThreshold: 5 },
  { plantName: "Japanese Maple Sango Kaku", botanicalName: "Acer palmatum", cultivar: "Sango Kaku", containerSize: "5 Gal", quantityAvailable: 11, quantityReserved: 0, quantitySold: 22, location: "Shade House", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 30.00, retailPrice: 109.99, wholesalePrice: 60.00, category: "Deciduous Trees", lowStockThreshold: 8 },

  // Rhododendrons
  { plantName: "PJM Rhododendron", botanicalName: "Rhododendron", cultivar: "PJM", containerSize: "3 Gal", quantityAvailable: 52, quantityReserved: 10, quantitySold: 97, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 11.00, retailPrice: 44.99, wholesalePrice: 24.00, category: "Broadleaf Evergreens", lowStockThreshold: 20 },
  { plantName: "Rhododendron Nova Zembla", botanicalName: "Rhododendron", cultivar: "Nova Zembla", containerSize: "3 Gal", quantityAvailable: 28, quantityReserved: 5, quantitySold: 44, location: "Shade House", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 12.00, retailPrice: 49.99, wholesalePrice: 26.00, category: "Broadleaf Evergreens", lowStockThreshold: 15 },
  { plantName: "Rhododendron Roseum Elegans", botanicalName: "Rhododendron catawbiense", cultivar: "Roseum Elegans", containerSize: "3 Gal", quantityAvailable: 35, quantityReserved: 7, quantitySold: 61, location: "Shade House", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 11.50, retailPrice: 46.99, wholesalePrice: 25.00, category: "Broadleaf Evergreens", lowStockThreshold: 15 },

  // Hollies
  { plantName: "Inkberry Holly", botanicalName: "Ilex glabra", cultivar: "Shamrock", containerSize: "3 Gal", quantityAvailable: 44, quantityReserved: 8, quantitySold: 76, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 8.00, retailPrice: 34.99, wholesalePrice: 18.00, category: "Broadleaf Evergreens", lowStockThreshold: 20 },
  { plantName: "Blue Princess Holly", botanicalName: "Ilex × meserveae", cultivar: "Blue Princess", containerSize: "3 Gal", quantityAvailable: 29, quantityReserved: 4, quantitySold: 53, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 9.00, retailPrice: 38.99, wholesalePrice: 20.00, category: "Broadleaf Evergreens", lowStockThreshold: 15 },
  { plantName: "Winterberry Holly Red Sprite", botanicalName: "Ilex verticillata", cultivar: "Red Sprite", containerSize: "3 Gal", quantityAvailable: 19, quantityReserved: 3, quantitySold: 31, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 10.00, retailPrice: 42.99, wholesalePrice: 22.00, category: "Deciduous Shrubs", lowStockThreshold: 12 },

  // Spirea
  { plantName: "Spirea Little Princess", botanicalName: "Spiraea japonica", cultivar: "Little Princess", containerSize: "2 Gal", quantityAvailable: 78, quantityReserved: 12, quantitySold: 143, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 5.50, retailPrice: 22.99, wholesalePrice: 11.00, category: "Deciduous Shrubs", lowStockThreshold: 30 },
  { plantName: "Spirea Goldflame", botanicalName: "Spiraea japonica", cultivar: "Goldflame", containerSize: "2 Gal", quantityAvailable: 56, quantityReserved: 8, quantitySold: 89, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 5.50, retailPrice: 22.99, wholesalePrice: 11.00, category: "Deciduous Shrubs", lowStockThreshold: 25 },
  { plantName: "Spirea Double Play Gold", botanicalName: "Spiraea japonica", cultivar: "Double Play Gold", containerSize: "2 Gal", quantityAvailable: 34, quantityReserved: 6, quantitySold: 67, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 6.00, retailPrice: 24.99, wholesalePrice: 12.00, category: "Deciduous Shrubs", lowStockThreshold: 20 },

  // Conifers
  { plantName: "Blue Star Juniper", botanicalName: "Juniperus squamata", cultivar: "Blue Star", containerSize: "3 Gal", quantityAvailable: 41, quantityReserved: 5, quantitySold: 58, location: "Field B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 10.00, retailPrice: 42.99, wholesalePrice: 22.00, category: "Conifers", lowStockThreshold: 15 },
  { plantName: "Gold Mop Cypress", botanicalName: "Chamaecyparis pisifera", cultivar: "Gold Mop", containerSize: "3 Gal", quantityAvailable: 33, quantityReserved: 4, quantitySold: 71, location: "Field B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 9.50, retailPrice: 39.99, wholesalePrice: 21.00, category: "Conifers", lowStockThreshold: 15 },
  { plantName: "Weeping Blue Atlas Cedar", botanicalName: "Cedrus atlantica", cultivar: "Glauca Pendula", containerSize: "5 Gal", quantityAvailable: 7, quantityReserved: 2, quantitySold: 11, location: "Field B", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 45.00, retailPrice: 179.99, wholesalePrice: 95.00, category: "Conifers", lowStockThreshold: 5 },
  { plantName: "Colorado Blue Spruce", botanicalName: "Picea pungens", cultivar: "Glauca", containerSize: "5 Gal", quantityAvailable: 24, quantityReserved: 3, quantitySold: 38, location: "Field B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 16.00, retailPrice: 64.99, wholesalePrice: 34.00, category: "Evergreen Trees", lowStockThreshold: 12 },

  // Perennials
  { plantName: "Black-Eyed Susan", botanicalName: "Rudbeckia fulgida", cultivar: "Goldsturm", containerSize: "1 Gal", quantityAvailable: 112, quantityReserved: 15, quantitySold: 234, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 3.00, retailPrice: 12.99, wholesalePrice: 6.00, category: "Perennials", lowStockThreshold: 40 },
  { plantName: "Coneflower Magnus", botanicalName: "Echinacea purpurea", cultivar: "Magnus", containerSize: "1 Gal", quantityAvailable: 89, quantityReserved: 12, quantitySold: 178, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 3.00, retailPrice: 12.99, wholesalePrice: 6.00, category: "Perennials", lowStockThreshold: 35 },
  { plantName: "Coneflower PowWow White", botanicalName: "Echinacea purpurea", cultivar: "PowWow White", containerSize: "1 Gal", quantityAvailable: 64, quantityReserved: 8, quantitySold: 122, location: "Hoop House B", propagationMethod: PropagationMethod.SEED, costPerUnit: 2.80, retailPrice: 11.99, wholesalePrice: 5.50, category: "Perennials", lowStockThreshold: 30 },
  { plantName: "Salvia May Night", botanicalName: "Salvia nemorosa", cultivar: "May Night", containerSize: "1 Gal", quantityAvailable: 73, quantityReserved: 10, quantitySold: 145, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 3.00, retailPrice: 12.99, wholesalePrice: 6.00, category: "Perennials", lowStockThreshold: 30 },
  { plantName: "Daylily Stella D'Oro", botanicalName: "Hemerocallis", cultivar: "Stella D'Oro", containerSize: "1 Gal", quantityAvailable: 95, quantityReserved: 18, quantitySold: 267, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 2.50, retailPrice: 10.99, wholesalePrice: 5.00, category: "Perennials", lowStockThreshold: 40 },
  { plantName: "Hosta Sum and Substance", botanicalName: "Hosta", cultivar: "Sum and Substance", containerSize: "2 Gal", quantityAvailable: 48, quantityReserved: 6, quantitySold: 87, location: "Shade House", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 6.00, retailPrice: 24.99, wholesalePrice: 13.00, category: "Perennials", lowStockThreshold: 20 },
  { plantName: "Hosta Halcyon", botanicalName: "Hosta", cultivar: "Halcyon", containerSize: "2 Gal", quantityAvailable: 37, quantityReserved: 4, quantitySold: 61, location: "Shade House", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 6.00, retailPrice: 24.99, wholesalePrice: 13.00, category: "Perennials", lowStockThreshold: 15 },

  // Native Plants
  { plantName: "Serviceberry Autumn Brilliance", botanicalName: "Amelanchier × grandiflora", cultivar: "Autumn Brilliance", containerSize: "5 Gal", quantityAvailable: 17, quantityReserved: 3, quantitySold: 29, location: "Field A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 22.00, retailPrice: 89.99, wholesalePrice: 48.00, category: "Deciduous Trees", lowStockThreshold: 10 },
  { plantName: "Sweetbay Magnolia", botanicalName: "Magnolia virginiana", containerSize: "5 Gal", quantityAvailable: 12, quantityReserved: 2, quantitySold: 18, location: "Field A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 24.00, retailPrice: 94.99, wholesalePrice: 50.00, category: "Deciduous Trees", lowStockThreshold: 8 },
  { plantName: "Buttonbush", botanicalName: "Cephalanthus occidentalis", containerSize: "3 Gal", quantityAvailable: 28, quantityReserved: 2, quantitySold: 31, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 8.00, retailPrice: 32.99, wholesalePrice: 17.00, category: "Native Plants", lowStockThreshold: 12 },
  { plantName: "Virginia Sweetspire Little Henry", botanicalName: "Itea virginica", cultivar: "Little Henry", containerSize: "3 Gal", quantityAvailable: 34, quantityReserved: 4, quantitySold: 48, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 8.50, retailPrice: 34.99, wholesalePrice: 18.00, category: "Native Plants", lowStockThreshold: 15 },

  // Ornamental Grasses
  { plantName: "Maiden Grass Morning Light", botanicalName: "Miscanthus sinensis", cultivar: "Morning Light", containerSize: "3 Gal", quantityAvailable: 43, quantityReserved: 6, quantitySold: 82, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 8.00, retailPrice: 34.99, wholesalePrice: 18.00, category: "Ornamental Grasses", lowStockThreshold: 20 },
  { plantName: "Karl Foerster Feather Reed Grass", botanicalName: "Calamagrostis × acutiflora", cultivar: "Karl Foerster", containerSize: "3 Gal", quantityAvailable: 55, quantityReserved: 8, quantitySold: 104, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 7.50, retailPrice: 31.99, wholesalePrice: 16.00, category: "Ornamental Grasses", lowStockThreshold: 20 },
  { plantName: "Hameln Dwarf Fountain Grass", botanicalName: "Pennisetum alopecuroides", cultivar: "Hameln", containerSize: "2 Gal", quantityAvailable: 67, quantityReserved: 10, quantitySold: 133, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 6.00, retailPrice: 24.99, wholesalePrice: 12.00, category: "Ornamental Grasses", lowStockThreshold: 25 },

  // Roses
  { plantName: "Knock Out Rose Red", botanicalName: "Rosa", cultivar: "Knock Out", containerSize: "3 Gal", quantityAvailable: 4, quantityReserved: 1, quantitySold: 211, location: "Greenhouse 2", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 11.00, retailPrice: 44.99, wholesalePrice: 24.00, category: "Roses", lowStockThreshold: 30, notes: "Extremely low stock - high demand" },
  { plantName: "Knock Out Rose Double Pink", botanicalName: "Rosa", cultivar: "Double Pink Knock Out", containerSize: "3 Gal", quantityAvailable: 11, quantityReserved: 3, quantitySold: 98, location: "Greenhouse 2", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 11.50, retailPrice: 46.99, wholesalePrice: 25.00, category: "Roses", lowStockThreshold: 25 },
  { plantName: "Drift Rose Coral", botanicalName: "Rosa", cultivar: "Coral Drift", containerSize: "2 Gal", quantityAvailable: 38, quantityReserved: 5, quantitySold: 76, location: "Greenhouse 2", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 9.00, retailPrice: 36.99, wholesalePrice: 20.00, category: "Roses", lowStockThreshold: 20 },

  // Trees
  { plantName: "Autumn Blaze Maple", botanicalName: "Acer × freemanii", cultivar: "Autumn Blaze", containerSize: "7 Gal", quantityAvailable: 13, quantityReserved: 3, quantitySold: 24, location: "Field A", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 35.00, retailPrice: 129.99, wholesalePrice: 68.00, category: "Deciduous Trees", lowStockThreshold: 8 },
  { plantName: "Flowering Crabapple Prairiefire", botanicalName: "Malus", cultivar: "Prairiefire", containerSize: "5 Gal", quantityAvailable: 19, quantityReserved: 2, quantitySold: 33, location: "Field A", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 26.00, retailPrice: 99.99, wholesalePrice: 54.00, category: "Deciduous Trees", lowStockThreshold: 10 },
  { plantName: "River Birch Heritage", botanicalName: "Betula nigra", cultivar: "Heritage", containerSize: "5 Gal", quantityAvailable: 21, quantityReserved: 4, quantitySold: 38, location: "Field A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 20.00, retailPrice: 79.99, wholesalePrice: 42.00, category: "Deciduous Trees", lowStockThreshold: 10 },
  { plantName: "Eastern Redbud", botanicalName: "Cercis canadensis", containerSize: "5 Gal", quantityAvailable: 26, quantityReserved: 5, quantitySold: 47, location: "Field A", propagationMethod: PropagationMethod.SEED, costPerUnit: 18.00, retailPrice: 69.99, wholesalePrice: 36.00, category: "Deciduous Trees", lowStockThreshold: 12 },
  { plantName: "Yoshino Cherry", botanicalName: "Prunus × yedoensis", cultivar: "Yoshino", containerSize: "5 Gal", quantityAvailable: 8, quantityReserved: 2, quantitySold: 14, location: "Greenhouse 1", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 28.00, retailPrice: 109.99, wholesalePrice: 58.00, category: "Deciduous Trees", lowStockThreshold: 8 },

  // Propagation stock
  { plantName: "Green Giant Arborvitae", botanicalName: "Thuja standishii × plicata", cultivar: "Green Giant", containerSize: "Liner", quantityAvailable: 200, quantityReserved: 0, quantitySold: 0, location: "Greenhouse 1", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 1.50, retailPrice: 0, wholesalePrice: 3.00, category: "Propagation Stock", lowStockThreshold: 100, notes: "Rooted cuttings for grow-on" },
  { plantName: "Boxwood Green Velvet", botanicalName: "Buxus", cultivar: "Green Velvet", containerSize: "Liner", quantityAvailable: 350, quantityReserved: 0, quantitySold: 0, location: "Greenhouse 1", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 0.75, retailPrice: 0, wholesalePrice: 1.50, category: "Propagation Stock", lowStockThreshold: 150, notes: "Needs potting into 2 gal within 2 weeks" },
  { plantName: "Hydrangea Limelight", botanicalName: "Hydrangea paniculata", cultivar: "Limelight", containerSize: "Liner", quantityAvailable: 125, quantityReserved: 0, quantitySold: 0, location: "Greenhouse 1", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 1.25, retailPrice: 0, wholesalePrice: 2.50, category: "Propagation Stock", lowStockThreshold: 80 },

  // Groundcovers
  { plantName: "Pachysandra Green Sheen", botanicalName: "Pachysandra terminalis", cultivar: "Green Sheen", containerSize: "4\" Pot", quantityAvailable: 286, quantityReserved: 24, quantitySold: 512, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 1.25, retailPrice: 5.99, wholesalePrice: 2.75, category: "Groundcovers", lowStockThreshold: 100 },
  { plantName: "Vinca Minor", botanicalName: "Vinca minor", containerSize: "4\" Pot", quantityAvailable: 198, quantityReserved: 16, quantitySold: 389, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 1.00, retailPrice: 4.99, wholesalePrice: 2.25, category: "Groundcovers", lowStockThreshold: 80 },
  { plantName: "Creeping Phlox White", botanicalName: "Phlox subulata", cultivar: "White Delight", containerSize: "1 Gal", quantityAvailable: 74, quantityReserved: 8, quantitySold: 137, location: "Hoop House B", propagationMethod: PropagationMethod.DIVISION, costPerUnit: 3.50, retailPrice: 14.99, wholesalePrice: 7.00, category: "Groundcovers", lowStockThreshold: 30 },

  // Viburnums
  { plantName: "Viburnum Koreanspice", botanicalName: "Viburnum carlesii", containerSize: "3 Gal", quantityAvailable: 23, quantityReserved: 4, quantitySold: 41, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 13.00, retailPrice: 52.99, wholesalePrice: 28.00, category: "Deciduous Shrubs", lowStockThreshold: 12 },
  { plantName: "Viburnum Snowball", botanicalName: "Viburnum opulus", cultivar: "Roseum", containerSize: "3 Gal", quantityAvailable: 31, quantityReserved: 5, quantitySold: 54, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 11.00, retailPrice: 44.99, wholesalePrice: 24.00, category: "Deciduous Shrubs", lowStockThreshold: 15 },
  { plantName: "Arrowwood Viburnum Blue Muffin", botanicalName: "Viburnum dentatum", cultivar: "Blue Muffin", containerSize: "3 Gal", quantityAvailable: 17, quantityReserved: 2, quantitySold: 28, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 10.00, retailPrice: 41.99, wholesalePrice: 22.00, category: "Native Plants", lowStockThreshold: 10 },

  // Azaleas
  { plantName: "Azalea Gibraltar", botanicalName: "Rhododendron", cultivar: "Gibraltar", containerSize: "3 Gal", quantityAvailable: 28, quantityReserved: 6, quantitySold: 52, location: "Shade House", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 10.50, retailPrice: 42.99, wholesalePrice: 23.00, category: "Flowering Shrubs", lowStockThreshold: 15 },
  { plantName: "Encore Azalea Autumn Fire", botanicalName: "Rhododendron", cultivar: "Autumn Fire", containerSize: "3 Gal", quantityAvailable: 19, quantityReserved: 4, quantitySold: 37, location: "Shade House", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 11.00, retailPrice: 45.99, wholesalePrice: 24.00, category: "Flowering Shrubs", lowStockThreshold: 12 },

  // Lilacs
  { plantName: "Lilac Common Purple", botanicalName: "Syringa vulgaris", containerSize: "3 Gal", quantityAvailable: 36, quantityReserved: 5, quantitySold: 63, location: "Field A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 10.00, retailPrice: 39.99, wholesalePrice: 21.00, category: "Deciduous Shrubs", lowStockThreshold: 15 },
  { plantName: "Bloomerang Purple Lilac", botanicalName: "Syringa", cultivar: "Bloomerang Purple", containerSize: "3 Gal", quantityAvailable: 24, quantityReserved: 4, quantitySold: 44, location: "Field A", propagationMethod: PropagationMethod.GRAFTING, costPerUnit: 13.00, retailPrice: 52.99, wholesalePrice: 28.00, category: "Deciduous Shrubs", lowStockThreshold: 12 },

  // Forsythia
  { plantName: "Forsythia Lynwood Gold", botanicalName: "Forsythia × intermedia", cultivar: "Lynwood Gold", containerSize: "3 Gal", quantityAvailable: 47, quantityReserved: 7, quantitySold: 88, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 7.00, retailPrice: 28.99, wholesalePrice: 14.00, category: "Deciduous Shrubs", lowStockThreshold: 20 },
  { plantName: "Show Off Forsythia", botanicalName: "Forsythia × intermedia", cultivar: "Show Off", containerSize: "3 Gal", quantityAvailable: 33, quantityReserved: 4, quantitySold: 58, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 8.00, retailPrice: 32.99, wholesalePrice: 17.00, category: "Deciduous Shrubs", lowStockThreshold: 15 },

  // Additional variety
  { plantName: "Weigela My Monet", botanicalName: "Weigela florida", cultivar: "My Monet", containerSize: "2 Gal", quantityAvailable: 42, quantityReserved: 5, quantitySold: 74, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 7.50, retailPrice: 30.99, wholesalePrice: 16.00, category: "Deciduous Shrubs", lowStockThreshold: 20 },
  { plantName: "Burning Bush Compact", botanicalName: "Euonymus alatus", cultivar: "Compactus", containerSize: "3 Gal", quantityAvailable: 38, quantityReserved: 6, quantitySold: 71, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 8.00, retailPrice: 33.99, wholesalePrice: 17.00, category: "Deciduous Shrubs", lowStockThreshold: 15 },
  { plantName: "Beautyberry American", botanicalName: "Callicarpa americana", containerSize: "3 Gal", quantityAvailable: 22, quantityReserved: 3, quantitySold: 31, location: "Hoop House A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 8.50, retailPrice: 34.99, wholesalePrice: 18.00, category: "Deciduous Shrubs", lowStockThreshold: 10 },
  { plantName: "Ninebark Coppertina", botanicalName: "Physocarpus opulifolius", cultivar: "Coppertina", containerSize: "3 Gal", quantityAvailable: 29, quantityReserved: 4, quantitySold: 53, location: "Field A", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 9.00, retailPrice: 36.99, wholesalePrice: 19.00, category: "Deciduous Shrubs", lowStockThreshold: 15 },
  { plantName: "Potentilla Goldfinger", botanicalName: "Potentilla fruticosa", cultivar: "Goldfinger", containerSize: "2 Gal", quantityAvailable: 51, quantityReserved: 7, quantitySold: 96, location: "Hoop House B", propagationMethod: PropagationMethod.CUTTING, costPerUnit: 5.50, retailPrice: 22.99, wholesalePrice: 11.00, category: "Deciduous Shrubs", lowStockThreshold: 20 },
];

export async function seedDemoData() {
  console.log("🌱 Seeding demo data...");

  // Create locations
  const locationMap: Record<string, string> = {};
  for (const loc of DEMO_LOCATIONS) {
    const created = await prisma.location.upsert({
      where: { name: loc.name },
      update: { isDemo: true },
      create: { ...loc, isDemo: true },
    });
    locationMap[loc.name] = created.id;
  }
  console.log(`✅ Created ${DEMO_LOCATIONS.length} locations`);

  // Create inventory
  let inventoryCount = 0;
  const createdInventory: { id: string; quantityAvailable: number }[] = [];
  for (const item of DEMO_INVENTORY) {
    const { location, ...rest } = item;
    const created = await prisma.inventory.create({
      data: {
        ...rest,
        costPerUnit: rest.costPerUnit,
        retailPrice: rest.retailPrice,
        wholesalePrice: rest.wholesalePrice,
        locationId: location ? locationMap[location] : null,
        isDemo: true,
      },
    });
    createdInventory.push({ id: created.id, quantityAvailable: created.quantityAvailable });
    inventoryCount++;
  }
  console.log(`✅ Created ${inventoryCount} inventory records`);

  // Create some transactions for history
  const transactionTypes = [TransactionType.ADD, TransactionType.REMOVE, TransactionType.ADJUST];
  let txCount = 0;
  for (const inv of createdInventory.slice(0, 30)) {
    const numTx = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numTx; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          type,
          quantity: Math.floor(Math.random() * 20) + 1,
          notes: type === TransactionType.ADD ? "Received from propagation" : type === TransactionType.REMOVE ? "Customer sale" : "Inventory adjustment",
          isDemo: true,
        },
      });
      txCount++;
    }
  }
  console.log(`✅ Created ${txCount} transactions`);

  // Create AI insights
  const insights = [
    { type: InsightType.INVENTORY_ANALYST, title: "Critical: Knock Out Rose Red at 1.9% Stock Level", body: "Knock Out Rose Red currently has only 4 units available against a low stock threshold of 30. This represents one of your highest-volume sellers with 211 units sold. Immediate action required: contact suppliers or prioritize propagation.", severity: Severity.CRITICAL },
    { type: InsightType.INVENTORY_ANALYST, title: "Low Stock: Boxwood Green Velvet Approaching Depletion", body: "Boxwood Green Velvet has only 5 units available (threshold: 30). With 158 units sold this season, this is a top performer. Consider ordering 150+ units from your propagation stock to meet ongoing demand.", severity: Severity.CRITICAL },
    { type: InsightType.INVENTORY_ANALYST, title: "Low Stock Alert: Hydrangea Limelight 3 Gal", body: "Hydrangea Limelight 3 Gal has 8 units remaining against a threshold of 20. You have 125 liners in Greenhouse 1 that could be potted up. Estimated 6-8 weeks to reach sellable size.", severity: Severity.WARNING },
    { type: InsightType.PRODUCTION_PLANNER, title: "Propagation Recommended: Hydrangea Limelight Within 30 Days", body: "Based on current sell-through rates, Hydrangea Limelight will be depleted in approximately 3-4 weeks. With a 12-week rooting period for cuttings, you should begin propagation immediately to avoid a supply gap in the peak summer season.", severity: Severity.WARNING },
    { type: InsightType.PRODUCTION_PLANNER, title: "Pot Up Recommendation: 350 Boxwood Liners Ready", body: "Greenhouse 1 contains 350 Boxwood Green Velvet liners noted as ready for potting. Potting these into 2-gallon containers now would yield saleable plants in 8-10 weeks, perfectly timed for fall sales.", severity: Severity.WARNING },
    { type: InsightType.PRODUCTION_PLANNER, title: "Plan Ahead: Japanese Maple Stock Aging Well", body: "Japanese Maple Bloodgood 5 Gal inventory of 16 units is moving at approximately 1.2 units/week. No immediate propagation needed, but note that grafted stock has 18-24 month lead time. Monitor and plan for next season.", severity: Severity.INFO },
    { type: InsightType.OPERATIONS_ADVISOR, title: "Field A Underutilization Detected", body: "Field A currently houses deciduous trees and native plants but appears to have capacity for 25-30% more inventory based on typical spacing requirements. Consider relocating overflow from Hoop House A to optimize growing conditions.", severity: Severity.INFO },
    { type: InsightType.OPERATIONS_ADVISOR, title: "Weekly Summary: Strong Perennial Sales Trend", body: "Perennial sales are up 23% week-over-week. Black-Eyed Susan, Coneflower, and Salvia are leading sellers. Hoop House B is at approximately 78% capacity. Consider expanding perennial production for next season.", severity: Severity.INFO },
    { type: InsightType.OPERATIONS_ADVISOR, title: "Recommendation: Consolidate Small Quantities", body: "Several inventory items have fewer than 10 units across multiple container sizes. Consolidating these to a single location would reduce management overhead and improve customer-facing presentation.", severity: Severity.INFO },
  ];

  for (const insight of insights) {
    await prisma.aiInsight.create({ data: { ...insight, isDemo: true } });
  }
  console.log(`✅ Created ${insights.length} AI insights`);
  console.log("🎉 Demo data seeded successfully!");
}

export async function deleteDemoData() {
  console.log("🗑️ Deleting demo data...");

  await prisma.aiInsight.deleteMany({ where: { isDemo: true } });
  await prisma.inventoryTransaction.deleteMany({ where: { isDemo: true } });
  await prisma.inventory.deleteMany({ where: { isDemo: true } });
  await prisma.location.deleteMany({ where: { isDemo: true } });

  console.log("✅ Demo data deleted");
}

async function main() {
  const action = process.argv[2];
  if (action === "delete") {
    await deleteDemoData();
  } else {
    await seedDemoData();
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
