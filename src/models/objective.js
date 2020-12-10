const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const objectiveSchema = new Schema(
  {
    text: {
      type: String,
      uninque: true,
      trim: true,
      required: true,
    },
    is_timed: { type: Boolean, required: true },
    difficulty: { type: String, required: true },
    difficulty_factor: { type: Number, required: true, },
    id: { type: String, unique: true, required: true, },
    creature: { type: Schema.Types.ObjectId, ref: 'Creature' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

