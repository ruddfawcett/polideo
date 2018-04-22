var PMath = {
  VOLATILITY: 0.76,
  RVMAX: 2,
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
    let jump = (RV / this.RVMAX) * Math.pow((1 - Math.abs(AV)), 2);

    function s() {
      return  ((RV < 0 && AV < 0) || (RV > 0 && AV > 0)) ? true : false;
    }

    if (s()) {
      return this.VOLATILITY * jump;
    }

    return jump;
  }
}
