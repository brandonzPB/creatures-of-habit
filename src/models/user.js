const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: { type: String, required: true, },
    id: { type: String, required: true, unique: true, },
    reset_code: { type: String, required: true, unique: false },
  },
  { timestamps: true },
);

userSchema.statics.findByLogin = async function (login) {
  let user = await this.findOne({ username: login });

  if (!user) {
    user = await this.findOne({ email: login })
  }

  return user;
};

userSchema.pre('remove', function(next) {
  this.model('Creature').deleteMany({ user: this._id }, next);
});

// userSchema.pre('save', function(next) {
//   const user = this;

//   if (!user.isModified('password')) return next();

//   bcrypt.genSalt(10, function(err, hash) {
//     if (err) return next(err);

//     bcrypt.hash(user.password, 10, function(err, hash) {
//       if (err) return next(err);

//       user.password = hash;
//       next();
//     });
//   });
// });

// userSchema.methods.comparePassword = function(candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//     if (err) { return cb(err); }

//     cb(null, isMatch);
//   });
// }

module.exports = mongoose.model('User', userSchema);
