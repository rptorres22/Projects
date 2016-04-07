import alt from '../alt';
import NavbarActions from '../actions/NavbarActions';

class NavbarStore {

	constructor() {
		this.bindActions(NavbarActions);
		// above is an Alt method which binds actions to their handlers defined
		// in this store.  An action name with name "foo" will match an action handler
		// method defined in the stored named "onFoo" or just "foo" but not both

		this.totalCharacters = 0;
		this.onlineUsers = 0;
		this.searchQuery = '';
		this.ajaxAnimationClass = '';
	}

	onFindCharacterSuccess(payload) {
		payload.history.pushState(null, '/characters/' + payload.characterId);
	}

	onFindCharacterFail(payload) {
		//The reason why we add the shake CSS class and then remove it one second later is so 
		//that we could repeat this animation, otherwise if we just keep on adding the shake 
		//it will not animate again.

		payload.searchForm.classList.add('shake');
		setTimeout(() => {
			payload.searchForm.classList.remove('shake');
		}, 1000);
	}

	onUpdateOnlineUsers(data) {
		this.onlineUsers = data.onlineUsers;
	}

	onUpdateAjaxAnimation(className) {
		this.ajaxAnimationClass = className; //fadein or fadeout
	}

	onUpdateSearchQuery(event) {
		this.searchQuery = event.target.value;
	}

	onGetCharacterCountSuccess(data) {
		this.totalCharacters = data.count;
	}

	onGetCharacterCountFail(jqXhr) {
		toastr.error(jqXhr.responseJSON.message);
	}

}

export default alt.createStore(NavbarStore);


