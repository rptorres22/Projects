// instance of Alt from alt.js not Alt module
// it is an instance of Alt which instantiates Flux dispatcher and provides methods
// for creating Alt actions and stores.  Think of it as the glue between all of our 
// stores and actions
import alt from '../alt'; 

class FooterActions {
	constructor() {

		// Alt shorthand notation 
		// "If all of your actions are just straight through dipatches you can use shorthand"
		this.generateActions(
			'getTopCharactersSuccess',
			'getTopCharactersFail'
		);

		// Equivalent to this...
		/*
		getTopCharactersSuccess(payload) {
			this.dispatch(payload);
		}

		getTopChractersFail(payload) {
			this.dispatch(payload);
		}
		*/
	}

	getTopCharacters() {
		$.ajax({ url: '/api/characters/top' })
			.done((data) => {
				this.actions.getTopCharactersSuccess(data)
			})
			.fail((jqXhr) => {
				this.actions.getTopCharactersFail(jqXhr)
			});
	}
}

export default alt.createActions(FooterActions);