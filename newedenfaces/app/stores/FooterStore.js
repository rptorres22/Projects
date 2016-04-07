import alt from '../alt';
import FooterActions from '../actions/FooterActions';

class FooterStore {
	constructor() {
		this.bindActions(FooterActions); // does magic
		// above is an Alt method which binds actions to their handlers defined
		// in this store.  An action name with name "foo" will match an action handler
		// method defined in the stored named "onFoo" or just "foo" but not both

		this.characters = [];
	}

	onGetTopCharactersSuccess(data) {
		this.characters = data.slice(0, 5);
	}

	onGetTopCharactersFail(jqXhr) {
		// Handle multiple response formats, fallback to HTTP status code number.
		toastr.error(jqXhr.responseJSON && jqXhr.responseJSON.message || jqXhr.responseText || jqXhr.statusText);
	}
}

export default alt.createStore(FooterStore);