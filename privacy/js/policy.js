(function($) {
  $(".slider").slider({
	min: 1,
	max: 5,
	value: 2,
	orientation: "horizontal",
	range: "min"
  }).addSliderSegments(5);
})(jQuery);

