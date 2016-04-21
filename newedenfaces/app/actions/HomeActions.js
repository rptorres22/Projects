import alt from '../alt';

class HomeActions {
	constructor() {
		this.generateActions(
			'getTwoCharactersSuccess',
			'getTwoCharactersFail',
			'voteFail'
		);
	}

	getTwoCharacters() {
		$.ajax({ url: '/api/characters' })
			.done(data => {
				this.actions.getTwoCharactersSuccess(data);
			})
			.fail(jqXhr => {
				this.actions.getTwoCharactersFail(jqXhr.responseJSON.message);
			});
	}

	vote(winner, loser) {
		$.ajax({
			type: 'PUT',
			url: '/api/characters',
			data: { winner: winner, loser: loser }
		})
			.done(() => {
				this.actions.getTwoCharacters();
			})
			.fail((jqXhr) => {
				this.actions.voteFail(jqXhr.responseJSON.message);
			});
	}

	/*
	We do not need voteSuccess action here because getTwoCharacters already does 
	exactly what we need. In other words, after a successful vote, we need to fetch 
	two more random characters from the database.
	*/
}

export default alt.createActions(HomeActions);