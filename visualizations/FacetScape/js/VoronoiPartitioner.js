function VoronoiPartitioner(Size) {

    var origin = Size[0];
    var extent = Size[1];
    var parentArea = [[{X:origin[0], Y:origin[1]},
        {X:origin[0], Y:extent[1]},
        {X:extent[0], Y:extent[1]},
        {X:extent[0], Y:origin[1]}]];

    var cells = [];
    var stretch = 100000000;

    var voronoi = {};

    voronoi.layout = function(centroids, weights) {

        if(typeof(weights) == "undefined") {
            weights = [];
            for(var i = 0; i < centroids.length; i++) {
                weights.push((1.0 / centroids.length));
            }
        }
        if(centroids.length > weights.length) { return null;}

        cells = [];
        for(var i = 0; i < centroids.length; i++) {
            cells.push(createCell(centroids[i], weights[i]));
        }

        partition();

        var polys = [];
        for(var i = 0; i < cells.length; i++) {
            polys.push(cells[i].area[0]);
        }

        return polys;
    }

    voronoi.update = function(centroids, weights, movingCentroidIdx) {

        if(typeof(weights) == "undefined") {
            weights = [];
            for(var i = 0; i < centroids.length; i++) {
                weights.push((1.0 / centroids.length));
            }
        }
        if(centroids.length > weights.length) { return null;}

        cells = [];
        for(var i = 0; i < centroids.length; i++) {
            cells.push(createCell(centroids[i], weights[i]));
        }

        partition();

        var polys = [];
        for(var i = 0; i < cells.length; i++) {
            polys.push(cells[i].area[0]);
        }

        return polys;
    }

    function createCell(position, weight) {
        return {position: position, weight: weight, area: null}
    }

    function getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.X-p1.X,2)+Math.pow(p2.Y-p1.Y,2));
    }

    function partition() {
        for(var i = 0; i < cells.length; i++) {
            cells[i].area = parentArea;
        }

        for(var idx1 = 0; idx1 < cells.length; idx1++) {

            var constructed = cells[idx1].position;
            for(var idx2 = 0; idx2 < cells.length; idx2++) {
                if(idx1 != idx2) {
                    var w1 = cells[idx1].weight;
                    var w2 = cells[idx2].weight;

                    var current = cells[idx2].position;

                    var distance = getDistance(constructed, current);

                    var division = 0.0;
                    division =  (Math.pow(w1, 2) - Math.pow(w2,2) + Math.pow(distance,2)) / (2*distance);
//                    if(w1+w2 <= distance) {
//                        division =  (Math.pow(w1, 2) - Math.pow(w2,2) + Math.pow(distance,2)) / (2*distance);
//                    } else {
//                        if(w1 <= distance) {
//                            division = (w1/w2) * distance;
//                            console.log(division);
//                        } else {
//                            return;
//                        }
//                    }

                    var vector = {X:(current.X-constructed.X)/distance,Y:(current.Y-constructed.Y)/distance};
                    var center = {X:(constructed.X+vector.X*division),Y:(constructed.Y+vector.Y*division)};
                    var normal = {X:-vector.Y, Y:vector.X};

                    var clippingArea = [];
                    clippingArea.push({X:center.X-normal.X*stretch, Y:center.Y-normal.Y*stretch});
                    clippingArea.push({X:center.X+normal.X*stretch, Y:center.Y+normal.Y*stretch});
                    center.X = constructed.X+vector.X*stretch;
                    center.Y = constructed.Y+vector.Y*stretch;
                    clippingArea.push({X:center.X+normal.X*stretch, Y:center.Y+normal.Y*stretch});
                    clippingArea.push({X:center.X-normal.X*stretch, Y:center.Y-normal.Y*stretch});

                    var cpr = new ClipperLib.Clipper();
                    cpr.AddPolygons(cells[idx1].area, ClipperLib.PolyType.ptSubject);
                    cpr.AddPolygons([clippingArea], ClipperLib.PolyType.ptClip);
                    var solution_poly = new ClipperLib.Polygons();
                    var succeeded = cpr.Execute(ClipperLib.ClipType.ctDifference, solution_poly, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                    cells[idx1].area = solution_poly;
                }
            }
        }
    }

    return voronoi;
}