import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';
import { loadScript } from 'lightning/platformResourceLoader';
import BCRYPT from '@salesforce/resourceUrl/BcryptJS'; //Static resource of the bcrypt.js package.
import { hash, compare } from './bcrypt';

let generateHash;
let compareHash;

export default class BcryptLWC extends LightningElement {

    @api input;
    @api hash;
    @api costFactor;
    @api outputHash;
    @api outputStatus;

    bcryptInitialized = false;

    async renderedCallback() {
        if (this.bcryptInitialized) {
            return;
        }
        this.bcryptInitialized = true;

        //Try to load the bcrypt.js package from static resources. If import fails,
        //use the bcrypt.js file included in this component bundle.
        try {
            await loadScript(this, BCRYPT + '/index.js')
            .then(() => {
                //Conflicts with LWS and shadow DOM in experience sites might prevent accessing the script from a static resource.
                //If access fails, use the bcrypt.js file packaged in this LWC bundle as a fallback.
                generateHash = window.hash;
                compareHash = window.compare;

                if(!generateHash || !compareHash) {
                    generateHash = hash;
                    compareHash = compare;
                }
            })
            .catch(() => {
                
            }).finally(() => {
                if(!generateHash || !compareHash) {
                    throw new Exception();
                } else {
                    if(this.input && this.hash) {
                        this.compareHash(this.input, this.hash);
                    } else if (this.input && !this.hash) {
                        this.hashInput(this.input, this.costFactor);
                    } else {
                        console.log('Fallback: No input provided.');
                    }
                }
            })
        } catch (error) {
            console.log('There was an error loading bcrypt.js: Make sure the static resource exists and is accessible. Error: ' + error);
            this.postError();
        }
    }

    async hashInput() {
        try {
            const start = performance.now();
            let cost = 10;
            if(!this.costFactor) {
                cost = 10;
            } else {
                cost = this.costFactor;
            }
            const result = await generateHash(this.input, cost);
            //console.log('RESULT:', result);
            this.outputHash = result;
            this.outputStatus = true;
            const end = performance.now();
            console.log(`Operation took ${(end - start).toFixed(3)} ms`);
            this.dispatchEvent(new FlowNavigationNextEvent());
        } catch (e) {
            console.error('Hash failed:', e);
            this.outputHash = null;
            this.outputStatus = false;
            this.postError();
            this.dispatchEvent(new FlowNavigationNextEvent());
        }
    }

    async compareHash() {
        try {
            const start = performance.now();
            const result = await compareHash(this.input, this.hash);
            //console.log('RESULT:', result);
            this.outputHash = this.hash;
            this.outputStatus = result;
            const end = performance.now();
            console.log(`Operation took ${(end - start).toFixed(3)} ms`);
            this.dispatchEvent(new FlowNavigationNextEvent());
        } catch (e) {
            console.error('Hash failed:', e);
            this.outputHash = null;
            this.outputStatus = false;
            this.postError();
            this.dispatchEvent(new FlowNavigationNextEvent());
        }
    }

    postError() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'There was an error.',
                message: 'Your information was not saved. Please contact support for assistance.',
                variant: 'error',
                mode: 'sticky'
            })
        );
    }
}
