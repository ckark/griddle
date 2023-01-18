const validateInput = (e, r, t) => {
	if ('' === e) r.setSuggestions(t);
	else if (Number.isFinite(+e))
		if (+e <= 0) r.setError('Please select at least one element.');
		else {
			const s = t ? t.filter((s) => s.includes(e) && s !== e) : [];
			r.setSuggestions([e, ...s]);
		}
	else r.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query, key, result }) => {
	switch (key) {
		case 'columns':
			validateInput(query, result, ['1', '2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			validateInput(query, result, ['4', '8', '16', '24', '32', '40', '48', '56']);
			break;
		case 'sort':
			validateInput(query, result, ['No', 'Ascending', 'Descending']);
			break;
		default:
			return;
	}
});
figma.on('run', ({ parameters }) => {
	let origX = Number.MAX_SAFE_INTEGER,
		origY = Number.MAX_SAFE_INTEGER;
	for (let r of figma.currentPage.selection) (origX = Math.min(origX, r.x)), (origY = Math.min(origY, r.y));
	const sorted = () => {
			let e = 0;
			const o = figma.currentPage.selection.map((o) => {
				const n = o.parent;
				return (e = Math.min(e, n.children.indexOf(o))), { node: o, parent: n };
			});
			if ('Descending' === parameters.sort) o.sort((e, o) => e.node.name.toLocaleLowerCase().localeCompare(o.node.name.toLocaleLowerCase(), void 0, { numeric: !0 }));
			else {
				if ('Ascending' !== parameters.sort) return;
				o.sort((e, o) => o.node.name.toLocaleLowerCase().localeCompare(e.node.name.toLocaleLowerCase(), void 0, { numeric: !0 }));
			}
			const t = o[0].parent;
			let n = 0;
			for (let l of o) t.insertChild(e + n, l.node), n++;
		},
		format = (e) => {
			(e.primaryAxisSizingMode = 'AUTO'), (e.counterAxisSizingMode = 'AUTO'), (e.clipsContent = !1), (e.itemSpacing = parseInt(parameters.gap)), (e.backgrounds = []), (e.itemReverseZIndex = !0);
		},
		grid = (e, a) => {
			let r = [],
				t = [...figma.currentPage.selection].sort((e, r) => e.x - r.x).sort((e, r) => e.y - r.y);
			if ('No' === parameters.sort) for (e = t; e.length; ) r.push(e.splice(0, a));
			else if ('Descending' === parameters.sort) for (e = t.sort((e, r) => e.name.localeCompare(r.name)); e.length; ) r.push(e.splice(0, a));
			else if ('Ascending' === parameters.sort) for (e = t.sort((e, r) => r.name.localeCompare(e.name)); e.length; ) r.push(e.splice(0, a));
			let o = [];
			for (let e of figma.currentPage.selection) o.push(e.parent);
			const l = () => {
				let e = figma.createFrame();
				return (e.layoutMode = 'HORIZONTAL'), (e.name = 'Row'), format(e), e;
			};
			for (let e of r) {
				let r = l();
				for (let o of e) r.appendChild(o), t.push(o.parent);
				r.layoutMode = 'NONE';
			}
			let s = figma.createFrame();
			(s.layoutMode = 'VERTICAL'), (s.name = 'Grid'), format(s);
			for (let e of t) s.appendChild(e);
			for (let e of o) e.appendChild(s);
			let n = [];
			const f = [...figma.currentPage.selection];
			for (let e of f) n.push(e.parent), s.parent.appendChild(e);
			const p = [],
				i = [];
			for (let e of n) i.push(e.y);
			for (let e of f) p.push(e.x);
			let m = 0;
			for (let e of f) (e.x = p[m] + origX), (e.y = i[m] + origY), m++;
			s.remove(), ('Descending' !== parameters.sort && 'Ascending' !== parameters.sort) || sorted();
		};
	0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.'),
		figma.currentPage.selection.map((e) => {
			'COMPONENT_SET' === e.parent.type && ((figma.currentPage.selection = []), figma.closePlugin("You can't rearrange elements in component sets."));
		}),
		grid(figma.currentPage.selection, parseInt(parameters.columns)),
		figma.closePlugin('Selection griddled. 🧇');
});
