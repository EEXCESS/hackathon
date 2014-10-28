
var jaccard = {};

/*
 * Return mutual elements in the input sets
 */
jaccard.intersection = function (a, b) {
  var x = [];
  var check = function (e, cb) {
    if (~b.indexOf(e)) x.push(e);
    if (cb && typeof cb == 'function') cb(null);
  };

  a.forEach(check);
  return x;
}

/*
 * Return distinct elements from both input sets
 */
jaccard.union = function (a, b, c) {
  var x = [];
  var check = function (e, cb) {
    if (!~x.indexOf(e)) x.push(e);
    if (cb && typeof cb == 'function') cb(null);
  }

  a.forEach(check);
  b.forEach(check);
  return x;
}

/*
 * Similarity
 */
jaccard.index = function (a, b) {
  return jaccard.intersection(a, b).length / jaccard.union(a, b).length;
}

/*
 * Dissimilarity
 */
jaccard.distance = function (a, b) {
  return 1 - jaccard.index(a, b);
}