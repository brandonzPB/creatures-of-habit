const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const creatureSchema = new Schema(
  {
    creature: { type: String, required: true },
    id: { type: String, unique: true, required: true, },
    creature_name: { type: String, required: true, trim: true },
    purpose: { type: String, required: true },
    purpose_name: { type: String, required: true, trim: true },
    evolutions: [{ type: String, required: false }],
    level: { type: Number, required: true, min: 1, max: 100 },
    exp: { type: Number, required: true, min: 0, },
    exp_goal: { type: Number, required: true, min: 1, },
    prev_exp_goal: { type: Number, required: true, },
    exp_surplus: { type: Number, required: true, },
    difficulty: { type: String, required: true, },
    multiplier: { type: Schema.Types.Mixed, required: true, },
    birth_date: { type: Date, required: true, },
    birth_time: { type: Number, required: true, },
    age: { type: Schema.Types.Mixed, required: true, },
    is_noob: { type: Boolean, required: true, },
    pokeball_number: { type: Number, required: true, },
    streak_count: { type: Number, required: true, },
    streak_day: { type: Number, required: true },
    streak_timestamp: { type: Schema.Types.Mixed, required: true, },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    objectives: [
      {
        text: { type: String, maxlength: 40, },
        difficulty: { type: String, required: true, },
        factor: { type: Number, required: true, },
        isTimed: { type: Boolean, required: true, },
        id: { type: String, required: true },
      }
    ]
  },
  { timestamps: true },
);

module.exports = mongoose.model('Creature', creatureSchema);
