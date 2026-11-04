import mongoose from 'mongoose'

// Roles: 'admin' (exactly one, created only by the seed script), 'owner', 'driver'.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 255, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'owner', 'driver'], default: 'driver', required: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Partial unique index: only documents with role "admin" are indexed, so a second admin is rejected
// by the database itself (duplicate key error), even if application code had a bug.
userSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: 'admin' }, name: 'uq_single_admin' })

userSchema.methods.toPublic = function toPublic() {
  return { id: this._id.toString(), name: this.name, email: this.email, role: this.role }
}

export default mongoose.model('User', userSchema)
