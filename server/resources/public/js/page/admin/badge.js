$(function() {
    var jBadgeList = $('#badge-list');
    var jBadgeModal = $('#badge-modal');
	var jSelectActiveImageButton = $('#select-active-image-button');
	var jDeleteActiveImageButton = $('#delete-active-image-button');
	var jSelectNotActiveImageButton = $('#select-not-active-image-button');
	var jDeleteNotActiveImageButton = $('#delete-not-active-image-button');
    var jPublishBadge = $('#publish-badge');
	var jImageSelector = $.defaultImageSelector({
		imageSubmitUrl:		'/admin/storage/image/save',
		imageListAjaxUrl:	'/admin/storage/image/list/{{:page}}'
	});

    var jActiveIconId = jBadgeModal.find('[name="imageActivateId"]');
    var jActiveIconImg = jActiveIconId.siblings('.icon');
    var jNotActiveIconId = jBadgeModal.find('[name="imageDeactivateId"]');
    var jNotActiveIconImg = jNotActiveIconId.siblings('.icon');

	jSelectActiveImageButton.click(function () {
		jImageSelector.selectOne(function(id, uri) {
            jActiveIconId.val(id);
            jActiveIconImg.attr('src', uri);
		});
	});

	jDeleteActiveImageButton.click(function () {
        jActiveIconId.val('');
        jActiveIconImg.attr('src', jActiveIconImg.data('default-src'));
	});

	jSelectNotActiveImageButton.click(function () {
		jImageSelector.selectOne(function(id, uri) {
            jNotActiveIconId.val(id);
            jNotActiveIconImg.attr('src', uri);
		});
	});

	jDeleteNotActiveImageButton.click(function () {
        jNotActiveIconId.val('');
        jNotActiveIconImg.attr('src', jNotActiveIconImg.data('default-src'));
	});

    jBadgeList.tableList({
        dataTemplateSelector:   '#badge-template',
        ajaxUrl:                '/admin/badge/list/{{:page}}'
    });

    jBadgeModal.modalForm({
        loadFormUrl:    '/admin/badge/{{:id}}',
	    onModalHidden:	function(jModal) {
        	jModal.find('img[data-default-src]').each(function(index, item) {
        		var jElement = $(item);
		        jElement.attr('src', jElement.data('default-src'));
	        });
	    },
        onSuccess:      function(jModal, data) {
            jBadgeList.refresh();
            jModal.modal('hide');
        },
        onFormLoaded:	function(jModal, data){
            jModal.title('Edit ' + data.name);
            if (data.imageActivate) {
                jActiveIconId.val(data.imageActivate.id);
                jActiveIconImg.attr('src', data.imageActivate.uri)
            }
            if(data.imageDeactivate) {
                jNotActiveIconId.val(data.imageDeactivate.id);
                jNotActiveIconImg.attr('src', data.imageDeactivate.uri)
            }
        }
    });

    jBadgeList.deleteConfirm({
        clickTarget:    '.delete',
        ajaxUrl:        '/admin/badge/{{:id}}',
        onSuccess:		function(data) {
            jBadgeList.refresh();
        }
    });

    jPublishBadge.bootstrapSwitch();
    jPublishBadge.on('switchChange.bootstrapSwitch', function(event, state) {
        if (state && (jActiveIconId.val() === '' || jNotActiveIconId.val() === '')) {
            jPublishBadge.bootstrapSwitch('state', false, true);
            jBadgeModal.message().showMessage("Badge can't be published without images");
        }
    });
});