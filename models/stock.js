import mongoose from 'mongoose'
const stockSchema = new mongoose.Schema({
  ticker: { type: String },
  general: { type: mongoose.Schema.Types.Mixed },
  fundamentals: {
    highlights: { type: mongoose.Schema.Types.Mixed },
    valuation: { type: mongoose.Schema.Types.Mixed },
    sharesStats: { type: mongoose.Schema.Types.Mixed },
    technicals: { type: mongoose.Schema.Types.Mixed },
    splitsDividends: { type: mongoose.Schema.Types.Mixed },
    analystRatings: { type: mongoose.Schema.Types.Mixed },
    holders: { type: mongoose.Schema.Types.Mixed },
    insiderTransactions: { type: mongoose.Schema.Types.Mixed },
    esgScores: { type: mongoose.Schema.Types.Mixed },
    outstandingShares: { type: mongoose.Schema.Types.Mixed },
    earnings: { type: mongoose.Schema.Types.Mixed },
    financialStatements: { type: mongoose.Schema.Types.Mixed },
    dcf: { type: mongoose.Schema.Types.Mixed },
  },
  priceAction: { type: Array },
  dividendsData: { type: mongoose.Schema.Types.Mixed },
  buybacks: { type: mongoose.Schema.Types.Mixed },
  secFilings: { type: mongoose.Schema.Types.Mixed },
  competition: { type: mongoose.Schema.Types.Mixed },
  screenerData: { type: mongoose.Schema.Types.Mixed },


});

const Stock = mongoose.model('stock', stockSchema);

export default Stock;