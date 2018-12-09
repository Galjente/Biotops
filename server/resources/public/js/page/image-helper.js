var DEFAULT_IMAGE_ERROR_CODES = {
	400:        'Incorrect input parameters.',
	404:        'Sorry, image not found.',
	500:        'Sorry, can\'t load image.',
	'other':    'Unknown error, please try again later! :('
};
var DEFAULT_IMAGE_LIST_TEMPLATE =
    '<div id="image-\{{:id}}" class="col-md-3 image" data-selected="false" data-id="\{{:id}}" data-uri="\{{:uri}}">' +
        '<div class="panel panel-default">' +
            '<div class="panel-heading">' +
                '<div data-toggle="tooltip" data-placement="top" title="\{{:originalName}}">\{{:originalName}}</div>' +
            '</div>' +
            '<div class="panel-body" data-toggle="modal" data-target="#image-preview-modal" data-uri="\{{:uri}}">' +
                '<div class="overlay"></div>' +
                '<img src="\{{:uri}}" alt="\{{:originalName}}"/>' +
            '</div>' +
        '</div>' +
    '</div>';
var DEFAULT_IMAGE_SELECT_MODAL_TEMPLATE =
    '<div class="modal fade image-select-modal" tabindex="-1" role="dialog">' +
        '<div class="modal-dialog modal-lg" role="document">' +
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<h4 class="modal-title">Image select</h4>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<ul class="nav nav-tabs" role="tablist">' +
                        '<li role="presentation" class="active"><a href="#images" aria-controls="image" role="tab" data-toggle="tab" data-modal-button="Select">Images</a></li>' +
                        '<li role="presentation"><a href="#image-upload" aria-controls="image-upload" role="tab" data-toggle="tab" data-modal-button="Upload">Image upload</a></li>' +
                    '</ul>' +
                    '<div class="tab-content">' +
                        '<div role="tabpanel" class="tab-pane image-list-tab active" id="images">' +
                            '<h1>Available images</h1>' +
                            '<div class="row image-list">' +
                                '<div class="col-md-12 image-loading-area">' +
                                    '<div class="spinner"></div>' +
                                    '<div class="clearfix"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div role="tabpanel" class="tab-pane image-upload" id="image-upload">' +
                            '<h1>Upload new image</h1>' +
                            '<form action="{{:imageSubmitUrl}}" method="POST" enctype="multipart/form-data">' +
                                '<div class="alert" role="alert"></div>' +
                                '<div class="form-group">' +
                                    '<label>Image preview</label>' +
                                    '<div class="text-center"><img class="image-preview"/></div>' +
                                '</div>' +
                                '<div class="form-group">' +
                                    '<label>Image</label>' +
                                    '<input name="image" type="file" class="form-control" accept="image/*"/>' +
                                '</div>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                    '<button type="submit" class="btn btn-primary">{{:selectButtonName}}</button>' +
                    '<button type="button" class="btn btn-default" data-dismiss="modal">{{:closeButtonName}}</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

$.fn.imageCrop = function (options) {

	return this;
};

$.fn.imageGridList =function (options) {
	var settings = $.extend({
		dataTemplateSelector:		'',
		scrollingSectorSelector:	window,
		errorSelector:				'.alert',
		loaderSelector:            '.image-loading-area',
		imageSelector:				'.image',
		ajaxType:					'GET',
		ajaxUrl:					'',
		cache:                     false,
		errorCodeMessage:          {},
		modal:						false,
		beforeAppend:				function(jTemplate) {},
		onUrlRender:				function(jImageGridList) {}
	}, options);

	settings.errorCodeMessage = $.extend(DEFAULT_IMAGE_ERROR_CODES, settings.errorCodeMessage);

	var LOADING_STATUS_ALLOW = 0;
	var LOADING_STATUS_IN_PROGRESS = 1;
	var LOADING_STATUS_ERROR = 2;
	var LOADING_STATUS_NO_DATA = 3;

	var jImageGridList = this;
	var jAddNewImageButton = jImageGridList.find('.add-new');
	var jScrollingSector = $(settings.scrollingSectorSelector);
	var jLoading = jImageGridList.find('.image-loading-area');
	var jSpinner = jLoading.find('.spinner');

	var urlTemplate = $.templates(settings.ajaxUrl);
	var dataTemplate = $.templates(settings.dataTemplateSelector);
	var spinner = new Spinner();
	var loadingStatus = LOADING_STATUS_ALLOW;
	var currentPage = 0;

	spinner.spin(jSpinner[0]);

	function getUrlTemplate(page) {
		var data = {page: currentPage};
		data = $.extend(data, settings.onUrlRender(jImageGridList));
		return urlTemplate.render(data);
	}

	function addData(data) {
		if (data) {
            var jTemplate = $(dataTemplate.render(data));
			settings.beforeAppend(jTemplate);
            jLoading.before(jTemplate);
		}
	}

	var loadPage = function(page) {
		loadingStatus = LOADING_STATUS_IN_PROGRESS;
		$.ajax({
			type:		settings.ajaxType,
			url:		getUrlTemplate(page),
		}).done(function(data) {
			addData(data.content);
			currentPage = data.page + 1;
			if (currentPage >= data.totalPages) {
				loadingStatus = LOADING_STATUS_NO_DATA;
				jLoading.hide();
			} else {
				loadingStatus = LOADING_STATUS_ALLOW;
			}
		}).fail(function(data){
			var jsonData = data.responseJSON;
			if (jsonData && jsonData.errors && jsonData.errors.length > 0) {
				jErrorMessage.showMessage(jsonData.errors);
			} else {
				var errorMessage = settings.errorCodeMessage[data.status];
				jErrorMessage.showMessage(errorMessage ? errorMessage : settings.errorCodeMessage['other']);
			}
			loadingStatus = LOADING_STATUS_ERROR;
		});
	};

    jScrollingSector.scroll(function () {
    	var topOffset = settings.modal ? 0 : jImageGridList.position().top;
        var endOfModal = jScrollingSector.scrollTop() + jScrollingSector.height() >= topOffset + jImageGridList.height();
        if (endOfModal && loadingStatus == LOADING_STATUS_ALLOW) {
			loadPage(currentPage);
		}
    });


    this.retry = function() {
		loadPage(currentPage);
	};

    this.refresh = function () {
        jImageGridList.find(settings.imageSelector).remove();
        currentPage = 0;
        loadPage(currentPage);
    };

    this.appendImage = function (imageData) {
        if (imageData) {
            var jTemplate = $(dataTemplate.render(imageData));
            settings.beforeAppend(jTemplate);
            if (jAddNewImageButton.length) {
                jTemplate.insertAfter(jAddNewImageButton);
            } else {
                jImageGridList.prepend(jTemplate);
            }
        }
    };

	loadPage(0);

	return this;
};

$.fn.imageInputWithPreview = function(options) {
    var settings = $.extend({
        jImagePreview:		undefined,
		onLoadingStart:		function() {},
		onLoadingStop:		function() {}
    }, options);

    var jImageInput = this;
    var fileReader = new FileReader();

    var previewImage = function() {
        settings.onLoadingStart();
        if (this.files && this.files[0]) {
            fileReader.onload = function (e) {
            	if (settings.jImagePreview) {
                    settings.jImagePreview.attr('src', e.target.result);
                }
                settings.onLoadingStop();
            };

            fileReader.onerror = function (e) {
                //TODO find out how to show error jModal.message().showMessage("Can't load image for preview.");
                settings.onLoadingStop();
            };

            fileReader.readAsDataURL(this.files[0]);
        } else {
            settings.onLoadingStop();
        }
    };

    jImageInput.change(previewImage);

    this.clear = function() {
        if (settings.jImagePreview) {
            settings.jImagePreview.attr('src', '')
        }
        jImageInput.val('');
	};

    return this;
};

$.fn.imageUploadModal = function(options) {
    var settings = $.extend({
    	imagePreviewLocation:      'img.image-preview',
	    inputImageSelector:        'input[name="image"]',
        beforeAppend:				function(jTemplate) {},
        onUrlRender:				function(jImageUploadModal) {},
	    onSuccess:		            function(jImageUploadModal, data) {},
    }, options);

    var modalFormSettings = {
        onModalHidden:	function(jModal) {
            var jImagePreview = jForm.find(settings.imagePreviewLocation);
            jImagePreview.attr('src', '');
		},
        onSuccess: function(jModal, data) {
            settings.onSuccess(jModal, data);
		}
	};

    var jModal = this.modalForm(modalFormSettings);
    var jForm = jModal.form();
    var jImagePreview = jForm.find(settings.imagePreviewLocation);
    var jImageInput = jForm.find(settings.inputImageSelector).imageInputWithPreview({
        jImagePreview:	jImagePreview,
        onLoadingStart:		function() {
            jModal.loading().show();
		},
        onLoadingStop:		function() {
            jModal.loading().hide();
		}
	});

	return this;
};

$.fn.imageSelectModal = function(options) {
    var settings = $.extend({
        imageListTabSelector:      	'.image-list-tab',
		imageGridListSelector:		'.image-list',
        imageListTemplateSelector:	'',
		imageListAjaxType:			undefined,
		imageListAjaxUrl:			undefined,

        imageUploadTabSelector:    	'.image-upload',
        imagePreviewLocation:		'img.image-preview',
        inputImageSelector:			'input[name="image"]',
        secondWindow:               false,
    }, options);

	var jImageSelectModal = this;
	var jSubmitButton = jImageSelectModal.find('.modal-footer button[type="submit"]');
    var jCancelButton = jImageSelectModal.find('.modal-footer button[type="button"]');
	var jTabMenu = jImageSelectModal.find('a[data-toggle="tab"]');
	var jImageUploadTab = jImageSelectModal.find(settings.imageUploadTabSelector);
	var jImageGridListTab = jImageSelectModal.find(settings.imageListTabSelector)
    var jImageGridList = jImageGridListTab.find(settings.imageGridListSelector).imageGridList({
        dataTemplateSelector:		settings.imageListTemplateSelector,
		ajaxType:					settings.imageListAjaxType,
		ajaxUrl:					settings.imageListAjaxUrl,
        scrollingSectorSelector:	jImageSelectModal,
		cache:						true,
		modal:						true,
	});
    var jForm = jImageUploadTab.find('form').pageForm({
        onSuccess:			function(jForm, data){
            jImageGridList.appendImage(data);
            jForm.message().showMessage({type: 'info', message: 'Image successfully uploaded'})
            jImageInput.clear();
        },
        errorCodeMessage:	DEFAULT_IMAGE_ERROR_CODES,
        jSubmitButton:		jSubmitButton,
        jCancelButton:		jCancelButton
    });

    var jImagePreview = jForm.find(settings.imagePreviewLocation);
    var jImageInput = jForm.find(settings.inputImageSelector).imageInputWithPreview({
        jImagePreview:	jImagePreview,
        onLoadingStart:		function() {
            jForm.loading().show();
        },
        onLoadingStop:		function() {
            jForm.loading().hide();
        }
    });

    jTabMenu.on('show.bs.tab', function (event) {
		var jNewTab = $(event.target);
		var buttonName = jNewTab.data('modal-button');
        jSubmitButton.html(buttonName);
	});

    jImageSelectModal.on('hidden.bs.modal', function (event) {
        jImageInput.clear();
        var jSelectedImages = jImageSelectModal.find('.image[data-selected="true"]');
        jSelectedImages.data('data-selected', 'false');
        if (settings.secondWindow) {
            $('body').addClass('modal-open');
        }
	});

	this.selectOne = function(callback) {
        jImageSelectModal.modal("show");
        jImageGridList.on('click', '.image', function(event) {
            var jImageContainer = $(this);
            var data = jImageContainer.data();
            if (callback) {
                callback(data.id, data.uri);
            }
            jImageGridList.off('click');
            jImageSelectModal.modal('hide');
        });
	};

	this.selectMultiple = function(callback) {
        console.error('Not implemented');
        callback();
	};

	return this;
};

$.defaultImageSelector = function(options) {
    var settings = $.extend({
        imageSubmitUrl:             undefined,
        imageListAjaxType:			undefined,
        imageListAjaxUrl:			undefined,

        selectButtonName:           'Select image',
        closeButtonName:            'Close',
        secondWindow:               false,
    }, options);
    var jImageSelectModal = $($.templates(DEFAULT_IMAGE_SELECT_MODAL_TEMPLATE).render(settings));

    jImageSelectModal.imageSelectModal({
        imageListTemplateSelector:  DEFAULT_IMAGE_LIST_TEMPLATE,
        imageListAjaxUrl:           settings.imageListAjaxUrl,
        imageListAjaxUrl:           settings.imageListAjaxUrl,
        secondWindow:               settings.secondWindow,
    });

    return jImageSelectModal;
};
