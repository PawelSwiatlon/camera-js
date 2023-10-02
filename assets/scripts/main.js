'use strict';

let Behemot = {

    $body: $('body'),
    $document: $(document),

    camera_options: {
        audio: false,
        camera_custom_resolution: false,
        video_custom_resolution_height: 1080,
        video_custom_resolution_width: 1920,
        aspectRatio: 16/9,
        facingMode: 'environment',
        camera_devices_select: '[data-camera-select]',
        camera_video: '[data-camera-video]',
    },

    currentStream: null,

    init: function() {
        this.cameraController();
    },

    cameraController: function() {
        if(typeof custom_camera_options != 'undefined') {
            for (const [key, value] of Object.entries(custom_camera_options)) {
                Behemot.camera_options[key] = value
            }
        }

        let cameraSelect;
        let videoContainer = Behemot.$body.find(Behemot.camera_options.camera_video)[0];

        const getDevices = async () => {
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();
            const devices = mediaDevices.filter( ( device ) => device.kind === 'videoinput' );
        
            return devices;
        }

        const updateStream = async ( videoDeviceId = null ) => {
            stopCamera();

            let constraints;
            if(Behemot.camera_options.camera_custom_resolution) {
                constraints = {
                    audio: Behemot.camera_options.audio,
                    video: {
                        deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
                        height: { ideal: Behemot.camera_options.video_custom_resolution_height },
                        width: { ideal: Behemot.camera_options.video_custom_resolution_width },
                        aspectRatio: Behemot.camera_options.aspectRatio,
                        facingMode: Behemot.camera_options.facingMode,
                    },
                };
            } else {
                constraints = {
                    audio: Behemot.camera_options.audio,
                    video: {
                        deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
                        height: { 
                            min: 640, 
                            ideal: 1600, 
                            max: 2592
                        },
                        width: { 
                            min: 480, 
                            ideal: 1200, 
                            max: 1944
                        },
                        aspectRatio: Behemot.camera_options.aspectRatio,
                        facingMode: Behemot.camera_options.facingMode,
                    },
                };
            }
        
            Behemot.currentStream = await navigator.mediaDevices.getUserMedia( constraints );
            videoContainer.srcObject = Behemot.currentStream;
            videoContainer.play();
            // console.log(URL.createObjectURL(Behemot.currentStream))
            // videoContainer.attr('src', URL.createObjectURL(Behemot.currentStream));
        };
        
        const startCamera = () => {
            updateStream().then( () => {
                if(cameraSelect)  {
                    cameraSelect.find( 'option:not(:first-child)' ).each( ( e ) => e.remove() );

                    getDevices().then( ( devices ) => {
                        devices.forEach( ( { deviceId, label } ) => {
                            const option = document.createElement( 'option' );
                            option.value = deviceId;
                            option.text = label || deviceId;
                            cameraSelect.append( option );
                        } );
                    });
                }
            });
        }

        const stopCamera = () => {
            if ( Behemot.currentStream ) {
                Behemot.currentStream.getTracks().forEach( ( track ) => {
                    track.stop();
                } );
                Behemot.currentStream = null;
            }
        }
        
        if(Behemot.$body.find(Behemot.camera_options.camera_devices_select).length > 0) {
            cameraSelect = Behemot.$body.find(Behemot.camera_options.camera_devices_select);
            cameraSelect.on( 'change', function() {
                updateStream( cameraSelect.value );
            });
        }
        
        Behemot.$document.on('CAMERA__TURN_ON', function(e){
            startCamera();
        });

        Behemot.$document.on('CAMERA__TURN_OFF', function(e){
            stopCamera();
        });

        Behemot.$document.on('CAMERA__GET_DEVICES', function(e){

        });

        $('[data-camera-start]').on('click', function() {
            Behemot.$document.trigger('CAMERA__TURN_ON')

        });
        $('[data-camera-stop]').on('click', function() {
            Behemot.$document.trigger('CAMERA__TURN_OFF')
        });
    }
}

$(document).ready(function (){
    Behemot.init();
});
