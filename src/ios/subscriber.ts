import {Observable} from 'data/observable';
import {topmost} from 'ui/frame';
import {TNSOTPublisherI} from '../common';

declare var OTSubscriber: any,
            CGRectMake: any,
            OTSubscriberKitDelegate: any,
            AVCaptureDevicePositionBack: any,
            AVCaptureDevicePositionFront: any;

export class TNSOTSubscriber  {

    private _subscriberKitDelegate;
    private _subscriberEvents: Observable;

    private _nativeSubscriber: any;

    constructor() {
        this._subscriberEvents = new Observable();
        this.registerSubcriberKitDelegate();
    }

    subscribe(session: any, stream: any) {
        this._nativeSubscriber = OTSubscriber.alloc().initWithStreamDelegate(stream, this._subscriberKitDelegate);
        session.subscribe(this._nativeSubscriber);
    }

    /**
     * Cleans the subscriber from the view hierarchy, if any.
     * NB: You do *not* have to call unsubscribe in your controller in response to
     * a streamDestroyed event. Any subscribers (or the publisher) for a stream will
     * be automatically removed from the session during cleanup of the stream.
     */
    cleanup() {
        let subscriber = this._nativeSubscriber;
        if(subscriber) {
            subscriber.view.removeFromSuperview();
            subscriber = null;
            this._subscriberEvents.notify({
                eventName: 'didStopSubscribing',
                object: null
            });
        }
    }

    get subscriberEvents(): Observable {
        return this._subscriberEvents;
    }

    private registerSubcriberKitDelegate() {
        this._subscriberKitDelegate = NSObject.extend({
            subscriberDidFailWithError(subscriber: any, error: any) {
                if(this._subscriberEvents) {
                    this._subscriberEvents.notify({
                        eventName: 'didFailWithError',
                        object: new Observable({
                            subscriber: subscriber,
                            error: error
                        })
                    });
                }
            },
            subscriberDidConnectToStream(subscriber) {
                console.log('Subscriber did connect to stream!');
                // Todo - add subscriber subview here
                subscriber.view.frame = CGRectMake(0, 100, 100, 100);// Todo - allow for custom positioning?
                topmost().currentPage.ios.addSubview(subscriber.view);
            },
            subscriberDidDisconnectFromStream(subscriber: any) {
                if(this._subscriberEvents) {
                    this._subscriberEvents.notify({
                        eventName: 'didDisconnectFromStream',
                        object: subscriber
                    });
                }
            },
            subscriberDidReconnectToStream(subscriber: any) {

            },
            subscriberVideoDisableWarning(subscriber: any) {

            },
            subscriberVideoDisableWarningLifted(subscriber: any) {

            },
            subscriberVideoDisabledReason(subscriber, reason) {

            },
            subscriberVideoEnabledReason(subscriber, reason) {

            }
        }, {
            protocols: [OTSubscriberKitDelegate]
        });
    }

      /**
     * Cleans the subscriber from the view hierarchy, if any.
     * @returns {Promise<any>}
     */
	// unsubscribe(): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         let subscriber = this._subscriber;
    //         if(subscriber) {
    //             if(this.session) {
    //                 try {
    //                     this.session.unsubscribe(subscriber);
    //                     resolve(true);
    //                 } catch(error) {
    //                     console.log('Failed to unsubscribe from session: ' + error);
    //                     reject(error);
    //                 }
    //                 subscriber.view.removeFromSuperview();
    //                 this._subscriber = null;
    //             }
    //         }
    //     });
    // }

}