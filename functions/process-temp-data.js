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
    let avgIdx = -1
    let minIdx = -1
    let maxIdx = -1

    const firstRow = sheet.getRow(1)
    for (let i = 1; i <= 3; i++) {
      if (firstRow.getCell(i).value === 'avg') {
        avgIdx = i
      } else if (firstRow.getCell(i).value === 'min') {
        minIdx = i
      } else if (firstRow.getCell(i).value === 'max') {
        maxIdx = i
      }
    }

    const data = []
    for (let i = 2; i <= 13; i++) {
      const row = sheet.getRow(i)
      const avg = row.getCell(avgIdx).value
      const min = row.getCell(minIdx).value
      const max = row.getCell(maxIdx).value

      if (avg && min && max) {
        data.push({ avg, min, max })
      }
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

    const isTempFile = filePath.match(/^uploads\/temperature\/[A-Za-z0-9]+/)

    if (!isTempFile) {
      return
    }

    const bucket = admin.storage().bucket(obj.bucket)
    const fileName = basename(filePath)
    const destination = join(temp, fileName)
    const id = basename(dirname(filePath))

    await bucket.file(filePath).download({ destination })

    const workbook = new Excel.Workbook()
    await workbook.xlsx.readFile(destination)

    const p = []

    workbook.eachSheet((sheet) => {
      const year = parseInt(sheet.name)
      const data = getData(sheet)

      data.forEach(({ avg, min, max }, i) => {
        const docId = `${year}${i.toString().padStart(2, '0')}`
        const action = db
          .collection('temp-location')
          .doc(id)
          .collection('temps')
          .doc(docId)
          .set({
            avg,
            min,
            max,
            year,
            month: i,
          })
        p.push(action)
      })
    })

    await Promise.all(p)
  }

  return loadData
}
