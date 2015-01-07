
$(window).load(function() { 
	$("#loader").fadeOut();				
});

$(function(){


	//---------------------------------------------------------------------- BANNER SLIDER
	if($(".flexslider").length != 0) {
		$('.flexslider').flexslider({
			animation: "slide",
			start: function(slider){
			  $('body').removeClass('loading');
			}
		});
	}
				

	
	


	
});


