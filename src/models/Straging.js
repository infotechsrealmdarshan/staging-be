import mongoose from "mongoose";

const areaItemSchema = new mongoose.Schema(
  {
    instanceId: { type: String, required: true }, // Unique ID for this placement
    itemId: { type: String, required: true }, // References the project library item
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 }, // Rotation in degrees
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    flipX: { type: Boolean, default: false },
    flipY: { type: Boolean, default: false },
    imageUrl: { type: String }, // Cache image URL for easy access
  },
  { _id: true, timestamps: true }
);

const areaSchema = new mongoose.Schema(
  {
    areaId: { type: String, required: true }, // Unique area identifier
    areaName: { type: String, required: true },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    imageName: { type: String },
    imageType: { type: String },
    parentHotspotId: { type: String, default: null }, // hotspot that opened this area
    items: { type: [areaItemSchema], default: [] }, // Items placed in this area
  },
  { _id: true, timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    imageName: { type: String },
    imageType: { type: String },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);

const hotspotSchema = new mongoose.Schema(
  {
    hotspotId: { type: String, required: true }, // Unique hotspot identifier
    title: { type: String, required: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    parentAreaId: { type: String, required: true }, // area where hotspot is placed
    childAreaId: { type: String, default: null }, // area opened by this hotspot
    imageUrl: { type: String },
    imagePublicId: { type: String },
    imageName: { type: String },
    imageType: { type: String },
  },
  { _id: true, timestamps: true }
);

const infoItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    areaId: { type: String, required: true } // area this info belongs to
  },
  { _id: true, timestamps: true }
);

const stragingImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String },
    type: { type: String, enum: ["fromgallery", "capture"], required: true },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: true }
);

const stragingSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true, trim: true },
    streetAddress: { type: String, required: true, trim: true },
    aptLandmark: { type: String, trim: true },
    cityLocality: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    url: { type: String }, // Direct image URL when created directly
    public_id: { type: String }, // Direct image public_id when created directly
    type: { type: String }, // Direct image type when created directly
    originalName: { type: String }, // Direct image original name when created directly
    mimeType: { type: String }, // Direct image mime type when created directly
    size: { type: Number }, // Direct image size when created directly
    images: { type: [stragingImageSchema], default: [] }, // For backward compatibility
    areas: { type: [areaSchema], default: [] }, // Areas with recursive relationships
    hotspots: { type: [hotspotSchema], default: [] }, // Hotspots with parent-child relationships
    info: { type: [infoItemSchema], default: [] }, // Info items linked to areas
    items: { type: [itemSchema], default: [] }, // Project-wide item library
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Remove unwanted fields
        delete ret.locations;
        delete ret.__v;
        delete ret.isOwn; // Remove isOwn from response
        delete ret.parent; // Remove parent from response

        // Remove isOwn from areas array
        if (ret.areas && Array.isArray(ret.areas)) {
          ret.areas = ret.areas.map(area => {
            const { isOwn, ...cleanArea } = area;
            return cleanArea;
          });
        }

        // Remove isOwn from hotspots array
        if (ret.hotspots && Array.isArray(ret.hotspots)) {
          ret.hotspots = ret.hotspots.map(hotspot => {
            const { isOwn, ...cleanHotspot } = hotspot;
            return cleanHotspot;
          });
        }

        // Ensure array fields are always returned as arrays, not null
        if (ret.info === null || ret.info === undefined) {
          ret.info = [];
        }
        if (ret.hotspots === null || ret.hotspots === undefined) {
          ret.hotspots = [];
        }
        if (ret.areas === null || ret.areas === undefined) {
          ret.areas = [];
        }
        if (ret.images === null || ret.images === undefined) {
          ret.images = [];
        }
        if (ret.items === null || ret.items === undefined) {
          ret.items = [];
        }
        return ret;
      }
    }
  }
);

export default mongoose.model("Straging", stragingSchema);
