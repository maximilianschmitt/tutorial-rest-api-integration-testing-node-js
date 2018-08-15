module.exports = class ValidationError extends Error {
  constructor(invalidFields) {
    super()

    this.name = 'ValidationError'
    this.invalidFields = invalidFields
  }
}
