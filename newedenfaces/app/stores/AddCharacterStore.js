import alt from '../alt';
import AddCharacterActions from '../actions/AddCharacterActions';

class AddCharacterStore {
	constructor() {
		this.bindActions(AddCharacterActions);
		this.name = '';
		this.gender = '';
		this.helpBlock = '';				//  is a status message which gets displayed below the text field, e.g. Character has been added successfully.
		this.nameValidationState = '';    	// refers to the validation states on form controls provided by Bootstrap.
		this.genderValidationState = ''; 	// refers to the validation states on form controls provided by Bootstrap.
	}

	onAddCharacterSuccess(successMessage) {
    	this.nameValidationState = 'has-success';
    	this.helpBlock = successMessage;
  	}

  	onAddCharacterFail(errorMessage) {
    	this.nameValidationState = 'has-error';
    	this.helpBlock = errorMessage;
  	}

  	onUpdateName(event) {
    	this.name = event.target.value;
    	this.nameValidationState = '';
    	this.helpBlock = '';
  	}

  	onUpdateGender(event) {
    	this.gender = event.target.value;
    	this.genderValidationState = '';
  	}
  	
	// handler is fired when Character Name field is empty. If the name does not exist in EVE Online database it will be a 
	// different error message provided by onAddCharacterFail handler.
  	onInvalidName() {
    	this.nameValidationState = 'has-error';
    	this.helpBlock = 'Please enter a character name.';
  	}

  	onInvalidGender() {
    	this.genderValidationState = 'has-error';
  	}
}

export default alt.createStore(AddCharacterStore);