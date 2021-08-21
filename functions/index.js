const admin = require('firebase-admin')
const functions = require('firebase-functions')
const processTempData = require('./process-temp-data')
const processLandingData = require('./process-landing-data')

if (admin.apps.length === 0) {
  admin.initializeApp()
}

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB',
}

exports.process_temp_data = functions
  .runWith(runtimeOpts)
  .storage.object()
  .onFinalize(processTempData(admin))

exports.process_landing_data = functions
  .runWith(runtimeOpts)
  .storage.object()
  .onFinalize(processLandingData(admin))
