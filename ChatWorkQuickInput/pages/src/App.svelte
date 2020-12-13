<script>
	import { onMount } from 'svelte';
	import Switch from './Switch.svelte';
	import '@fortawesome/fontawesome-free/js/fontawesome';
	import '@fortawesome/fontawesome-free/js/solid';
	
	let settings = [];

	let example = [
		{
			text: "集客master(gogo)",
			desc: "shuukyaku-gogo",
			html: "(gogo)",
			enableShortcut: false,
			keyBind: ''
		},
		{
			text: "chocolat master(gogo)",
			desc: "chocolat-gogo",
			html: "(chocolat-gogo)",
			enableShortcut: false,
			keyBind: ''
		}
	];

	settings = example;

	onMount(async () => {
		settings = await getSettings();
	});

	async function save() {
		let data = settings.filter(i => {return i.text !== '' && i.desc !== '' && i.html !== ''})
		chrome.storage.sync.set({settings: data}, function() {
        	alert('saved!');
		});
		settings = await getSettings();
	};

	function deleteSetting(key) {
		if(!confirm('delete ?'))return;
		settings = settings.filter((n, i) => {return i !== key});
	};

	function addSetting() {
		settings.push({
			text: "",
			desc: "",
			html: "",
			enableShortcut: false,
			keyBind: ''
		});
		settings = settings;
	};

	async function getSettings() {
		let p = new Promise(function(resolve, reject){
			chrome.storage.sync.get('settings',function(items) {
				resolve(items.settings ? items.settings : []);
			})
		});
		const configOut = await p;
		return configOut;
	};
</script>

<main>
	<h1>
		<i class="fas fa-cogs"></i>
		[SETTING]ChatWork Quick Input
		<i class="fas fa-cogs"></i>
	</h1>

	<div class="setting-main">
		<table class="styled-table shadow">
			<thead>
				<tr>
					<th>入力するテキスト</th>
					<th>説明（アイコンホバーで表示される）</th>
					<th>アイコン部分のHTML</th>
					<th>キーボードショートカットの有効化</th>
					<th>キーバインド</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each settings as setting, i}
					<tr>
						<td><textarea type="text" bind:value={setting.text}></textarea></td>
						<td><input type="text" bind:value={setting.desc}></td>
						<td><textarea type="text" bind:value={setting.html}></textarea></td>
						<td><Switch bind:checked="{setting.enableShortcut}" bind:id="{setting.desc}"/></td>
						<td>ctrlキー + <input type="text" bind:value={setting.keyBind} maxlength="1"></td>
						<td><button class="delete-setting" on:click="{() => deleteSetting(i)}"><i class="fas fa-trash-alt"></i></button></td>
					</tr>
				{/each}
				<tr>
					<td colspan="6">
						<button class="add-setting" on:click="{addSetting}">
							<i class="fas fa-plus-circle"></i>
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<button class="submit shadow" on:click="{save}">save</button>
	</div>
</main>

<style lang="scss">

	$theme: #009879;
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.setting-main {
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
	}

	.styled-table {
		border-collapse: collapse;
		margin: 25px 0;
		font-size: 0.9em;
		font-family: sans-serif;
		min-width: 400px;
		& thead tr {
			background-color: $theme;
			color: #ffffff;
			text-align: center;
		}
		& th {
			padding: 12px 15px;
		}
		& td {
			padding: 12px 15px;
			& textarea {
				min-width: 320px;
				width: 100%;
			}
		}
		& tbody{
			& tr {
				border-bottom: 1px solid #dddddd;
				&:nth-of-type(even) {
					background-color: #f3f3f3;
				}
				&:last-of-type(even) {
					border-bottom: 2px solid $theme;
				}
				&:last-of-type {
					font-size: 32px;
				}
			}
		}
	}

	button{
		border: none;
		line-height: 100%;
		margin-bottom: 0;
		cursor: pointer;
		background: none;
		&.submit {
			padding: 12px 24px;
			background-color: $theme;
			text-align: center;
			font-size: large;
			border-radius: 4px;
			font-weight: 400;
			color: white;
		}
		&.add-setting {
			color: $theme;
		}
		&.delete-setting {
			color: $theme;
			font-size: 32px;
		}
		&:hover {
			opacity: 0.7;
		}
	}

	.shadow {
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
	}
</style>