var PMath = {
  VOLATILITY: 1,
  PAV: 0,
  RVMAX: 4,
  AR: function(sumA, totN) {
    return sumA / totN;
  },
  AE: function(AR, sumRVV) {
    return AR * sumRVV;
  },
  IA: function(AEm, AEM) {
    return Math.abs(AEm) / Math.abs(AEM);
  },
  fAV: function(IA, RV, AV) {
    return AV + this.fDAV(IA, RV, AV);
  },
  fDAV: function(IA, RV, AV) {
    if (Math.abs(RV + AV) >= Math.abs(AV)) {
      return (RV / this.RVMAX) * Math.pow((1 - Math.abs(AV)), 2);
    }
    else {
      return this.VOLATILITY * (RV / this.RVMAX) * Math.pow((1 - Math.abs(AV)), 2);
    }
  }
}
