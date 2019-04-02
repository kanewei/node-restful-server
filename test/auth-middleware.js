const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/is-Auth');

describe('Auth middleware', function(){
    it('Throw error if no authorization in header', function(){
        const req = {
            get: function(){
                return null;
            }
        }

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.');
    });

    it('Throw error if only one string in authorization header', function(){
        const req = {
            get: function(){
                return 'one';
            }
        }

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.');
    });

    it('Token can not be verified', function(){
        const req = {
            get: function(){
                return 'bear one';
            }
        }

        sinon.stub(jwt, 'verify').returns(null);

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();

        jwt.verify.restore();
    });

    it('Token should have userId', function(){
        const req = {
            get: function(){
                return 'bear one';
            }
        }

        sinon.stub(jwt, 'verify').returns({userId: 'abc'});

        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    })
})