const { tmpdir } = require('os')
const { join, dirname, basename } = require('path')
require('core-js/modules/es.promise')
require('core-js/modules/es.string.includes')
require('core-js/modules/es.object.assign')
require('core-js/modules/es.object.keys')
require('core-js/modules/es.symbol')
require('core-js/modules/es.symbol.async-iterator')
require('regenerator-runtime/runtime')
const Excel = require('exceljs/dist/es5')

module.exports = (admin) => {
  const db = admin.firestore()

  function getData(sheet) {
    const data = []
    for (let i = 2; i <= 13; i++) {
      const row = sheet.getRow(i)
      const mass = row.getCell(1).value

      if (!mass) {
        break
      }

      data.push({ mass })
    }

    return data
  }

  async function loadData(obj) {
    const { name: filePath, contentType } = obj
    const temp = tmpdir()

    if (
      !contentType.startsWith(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
    ) {
      return
    }

    const isLandingFile = filePath.match(
      /^uploads\/landings\/[A-Za-z0-9]+\/[A-Za-z0-9]+/,
    )

    if (!isLandingFile) {
      return
    }

    const bucket = admin.storage().bucket(obj.bucket)
    const fileName = basename(filePath)
    const destination = join(temp, fileName)
    const locationId = basename(dirname(filePath))
    const vesselId = basename(dirname(dirname(filePath)))

    const snap = await db.collection('temp-location').doc(locationId).get()

    if (!snap.exists) {
      return
    }

    const { name } = snap.data()

    await bucket.file(filePath).download({ destination })

    const workbook = new Excel.Workbook()
    await workbook.xlsx.readFile(destination)

    const p = []

    workbook.eachSheet((sheet) => {
      const year = parseInt(sheet.name)
      const data = getData(sheet)

      data.forEach(({ mass }, i) => {
        const action = db
          .collection('vessels')
          .doc(vesselId)
          .collection('landings')
          .add({
            mass,
            year,
            month: i,
            location: {
              id: locationId,
              name,
            },
          })
        p.push(action)
      })
    })

    await Promise.all(p)
  }

  return loadData
}
