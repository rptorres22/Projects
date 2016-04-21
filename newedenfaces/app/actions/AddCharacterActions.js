import alt from '../alt';

class AddCharacterActions {

	constructor() {
		this.generateActions(
			'addCharacterSuccess', 	// when character has been added to db
			'addCharacterFail',		// when character could not be added
			'updateName',			// when the character name text field is updated via onChange
			'updateGender',			// when the character gender radio button is updated via onChange
			'invalidName',			// when character name is invalid
			'invalidGender'			// when character gender is invalid
		);
	}

	addCharacter(name, gender) {
		$.ajax({
			type: 'POST',
			url: '/api/characters',
			data: { name: name, gender: gender }
		})
			.done((data) => {
				this.actions.addCharacterSuccess(data.message);
			})
			.fail((jqXhr) => {
				this.actions.addCharacterFail(jqXhr.responseJSON.message);
			});
	}
}

export default alt.createActions(AddCharacterActions);