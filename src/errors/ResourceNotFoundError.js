module.exports = class ResourceNotFoundError extends Error {
  constructor(resource) {
    super()

    this.name = 'ResourceNotFoundError'
    this.resource = resource
  }
}
