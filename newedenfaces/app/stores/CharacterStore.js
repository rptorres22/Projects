import {assign, contains} from 'underscore';
import alt from '../alt';
import CharacterActions from '../actions/CharacterActions';

class CharacterStore {
	constructor() {
		this.bindActions(CharacterActions);
		this.characterId = 0;
		this.name = 'TBD';
		this.race = 'TBD';
		this.bloodline = 'TBD';
		this.gender = 'TBD';
		this.wins = 0;
		this.losses = 0;
		this.winLossRatio = 0;
		this.isReported = false;
	}

	/*
	Here we are using two Underscore’s helper functions assign and contains to merge 
	two objects and check if array contains a certain value, respectively.

	If a character is being reported for the first time, it is saved to Local Storage 
	under the NEF namespace. Since you cannot store objects and arrays in Local 
	Storage, we have to JSON.stringify() it first.
	*/
	onGetCharacterSuccess(data) {
		assign(this, data);
		$(document.body).attr('class', 'profile ' + this.race.toLowerCase());
		let localData = localStorage.getItem('NEF') ? JSON.parse(localStorage.getItem('NEF')) : {};
		let reports = localData.reports || [];
		this.isReported = contains(reports, this.characterId);
		// If is NaN (from division by zero) then set it to "0"
		this.winLossRatio = ((this.wins / (this.wins + this.losses) * 100) || 0).toFixed(1);
	}

	onGetCharacterFail(jqXhr) {
		toastr.error(jqXhr.responseJSON.message);
	}

	onReportSuccess() {
		this.isReported = true;
		let localData = localStorage.getItem('NEF') ? JSON.parse(localStorage.getItem('NEF')) : {};
		localData.reports = localData.reports || [];
		localData.reports.push(this.characterId);
		localStorage.setItem('NEF', JSON.stringify(localData));
		toastr.warning('Character has been reported.');
	}

	onReportFail(jqXhr) {
		toastr.error(jqXhr.responseJSON.message);
	}
}

export default alt.createStore(CharacterStore);