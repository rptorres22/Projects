import alt from '../alt';
import { assiogn } from 'underscore';

class NavbarActions {
	
	constructor() {
		this.generateActions(
			'updateOnlineUsers',			//Sets online users count on Socket.IO event update
			'updateAjaxAnimation',			//Adds "fadeIn" or "fadeOut" CSS class to the laoding indicator
			'updateSearchQuery',			//Update search query value on keypress
			'getCharacterCountSuccess',		//Returns total number of characters
			'getCharacterCountFail',		//Returns jQuery jqXhr object
			'findCharacterSuccess',			
			'findCharacterFail'			
		);
	}

	// Find a character by name
	findCharacter(payload) {
		$.ajax({
			url: '/api/characters/search',
			data: { name: payload.searchQuery }
		})
			.done((data) => {
				assign(payload, data);
				this.actions.findCharacterSuccess(payload);
			})
			.fail(() => {
				this.actions.findCharacterFail(payload);
			});
	}

	// Fetch total number of characters from the server
	getCharacterCount() {
		$.ajax({ url: '/api/characters/count'})
			.done((data) => {
				this.actions.getCharacterCountSuccess(data);
			})
			.fail((jqXhr) => {
				this.actions.getCharacterCountFail(jqXhr);
			});

	}

}

export default alt.createActions(NavbarActions);