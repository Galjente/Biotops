$(function() {
	var jPlaceList = $('#place-list');
	var jPlaceModal = $('#place-modal');
	var jPlaceExcelForm = $('#xlsx-form');
	var jAddImageButton = $('#add-image-button');
	var jDeleteImageButton = $('#delete-image-button');
	var jImageCarousel= $('#carousel-place-images');
	var jCarouselLeftButton = $('#carousel-place-left-button');
	var jCarouselRightButton = $('#carousel-place-right-button');
	var jImageSelector = $.defaultImageSelector({
		imageSubmitUrl:		'/admin/storage/image/save',
		imageListAjaxUrl:	'/admin/storage/image/list/{{:page}}',
        secondWindow:		true,
	});
	var jCurrentSlideImage = null;
    var modalImageTemplate = $.templates('#place-modal-image-template');

	$('input.checkbox-switch').bootstrapSwitch();
    jImageCarousel.carousel({
		interval: false
	});

	jPlaceList.tableList({
		dataTemplateSelector:   '#place-template',
		ajaxUrl:                '/admin/place/list/{{:page}}'
	});

	jPlaceList.deleteConfirm({
		clickTarget:    '.delete',
		ajaxUrl:        '/admin/place/{{:id}}',
		onSuccess:		function(data) {
			jPlaceList.refresh();
		}
	});

	jPlaceModal.modalForm({
		loadFormUrl:    '/admin/place/{{:id}}',
        onModalHidden:	function(jModal) {
            jModal.find('.selectpicker').selectpicker('deselectAll');
            jImageCarousel.find('.carousel-inner').html('<div class="item item-mock active"></div>');
		},
		onSuccess:      function(jModal, data) {
			jPlaceList.refresh();
			jModal.modal('hide');
		},
		onFormLoaded:	function(jModal, data){
			jModal.title('Edit ' + data.name);
            jModal.find('.selectpicker[name="categories"]').selectpicker('val', data.categories.map(function(value) {return value.id}));
            if (data.images && data.images.length) {
                jImageCarousel.find('.carousel-inner').html(modalImageTemplate.render(data.images));
                jCurrentSlideImage = jImageCarousel.find('.carousel-inner .item:first');
                jCurrentSlideImage.addClass('active');
			}
		}
	});

    jPlaceExcelForm.pageForm({
        onSuccess:		function(jForm, data) {
            jForm.message().showMessage({type: 'info', message:'Excel was successfully uploaded'});
	        jPlaceList.refresh();
		},
        onError:		function(jForm, data) {
        	jForm.reset();
		},
	});

    jPlaceExcelForm.change(function () {
        jPlaceExcelForm.submit();
    });

    jImageCarousel.on('slide.bs.carousel', function (event) {
	    jCurrentSlideImage = $(event.relatedTarget);
    });

	jAddImageButton.click(function () {
		jImageSelector.selectOne(function(id, uri) {
			var jCarouselContainer = jImageCarousel.find('.carousel-inner');
            jCarouselContainer.append(modalImageTemplate.render({id: id, uri: uri}));
            jCarouselContainer.find('.item-mock').remove();
            jCarouselContainer.find('.item.active').removeClass('active');
            jCurrentSlideImage = jCarouselContainer.find('.item:first');
            jCurrentSlideImage.addClass('active');
            // jImageCarousel.carousel({
            //     interval: false
            // });
		});
	});

	jDeleteImageButton.click(function() {
        var jCarouselContainer = jImageCarousel.find('.carousel-inner');
		if (jCurrentSlideImage) {
			jCurrentSlideImage.remove();
            jCarouselContainer.find('.item.active').removeClass('active');
            var firstItem = jCarouselContainer.find('.item:first');

            if (firstItem.length) {
                firstItem.addClass('active');
			} else {
                jCarouselContainer.html('<div class="item item-mock active"></div>');
			}
		}
	});
});