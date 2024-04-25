const assetAll = [
  {
    id: 1,
  },

]

const listAssetInUse = assetAll.filter((item) => item.status === 'in_use')
const listAssetReadyToUse = assetAll.filter((item) => item.status === 'ready_to_use')

const assets = {
  inUse: listAssetInUse,
  readyToUse: listAssetReadyToUse
}

module.exports = assets