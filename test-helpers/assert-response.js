const { expect } = require('chai').use(require('chai-as-promised'))

exports.isValidationError = async function isValidationError(
  request,
  invalidFields
) {
  const error = await expect(request).to.eventually.be.rejected

  const response = error.response

  expect(response).to.have.property('status', 400)

  expect(response).to.have.nested.property('data.error.name', 'ValidationError')

  Object.entries(invalidFields).forEach(([fieldName, expectedFieldError]) => {
    expect(response).to.have.nested.property(
      `data.error.invalidFields.${fieldName}`,
      expectedFieldError
    )
  })
}
