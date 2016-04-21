import React from 'react';
import {Link} from 'react-router';
import HomeStore from '../stores/HomeStore';
import HomeActions from '../actions/HomeActions';
import {first, without, findWhere} from 'underscore';

class Home extends React.Component {

	constructor(props) {
		super(props);
		this.state = HomeStore.getState();
		this.onChange = this.onChange.bind(this);
	}

	componentDidMount() {
		HomeStore.listen(this.onChange);
		HomeActions.getTwoCharacters();
	}

	componentWillUnmount() {
		HomeStore.unlisten(this.onChange);
	}

	onChange(state) {
		this.setState(state);
	}

	handleClick(character) {
		var winner = character.characterId;
		var loser = first(without(this.state.characters, 
							findWhere(this.state.characters, { characterId: winner }))
						).characterId;
		HomeActions.vote(winner, loser);
	}

	render() {

		/*
		Notice we are not just binding this.handleClick to a click event, 
		but instead we do {this.handleClick.bind(this, character). Simply 
		passing an event object is not enough, it will not give us any 
		useful information, unlike text field, checkbox or radio button 
		group elements.

		From the MSDN Documentation:
		function.bind(thisArg[, arg1[, arg2[, ...]]])
		thisArg (Required) - An object to which the this keyword can refer 
		inside the new function.
		arg1, arg2, … (Optional) - A list of arguments to be passed to the 
		new function.

		To put it simply, we need to pass this context because we are 
		referencing this.state inside handleClick method, we are passing a 
		custom object containing character information that was clicked 
		instead of the default event object.
		Inside handleClick method, the character parameter is our winning 
		character, because that’s the character that was clicked on. Since we 
		only have two characters it is not that hard to figure out the losing 
		character. We then pass both winner and loser Character IDs to the 
		HomeActions.vote action.
		*/
		var characterNodes = this.state.characters.map((character, index) => {
			return (
				<div key={character.characterId} className={index === 0 ? 'col-xs-6 col-sm-6 col-md-5 col-md-offset-1' : 'col-xs-6 col-sm-6 col-md-5'}>
					<div className='thumbnail fadeInUp animated'>
						<img onClick={this.handleClick.bind(this, character)} src={'http://image.eveonline.com/Character/' + character.characterId + '_512.jpg'} />
						<div className='caption text-center'>
							<ul className='list-inline'>
								<li><strong>Race:</strong>{character.race}</li>
								<li><strong>Bloodline:</strong>{character.bloodline}</li>
							</ul>
							<h4>
								<Link to={'/characters/' + character.characterId}><strong>{character.name}</strong></Link>
							</h4>
						</div>
					</div>
				</div>
			);
		});

		return (
			<div className='container'>
				<h3 className='text-center'>Click on the portrait. Select your favorite.</h3>
				<div classsName='row'>
					{characterNodes}
				</div>
			</div>
		);
	}
}

export default Home;