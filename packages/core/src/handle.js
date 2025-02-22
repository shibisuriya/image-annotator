import { isValidUnit } from './utils/utils.js';
export default class Handle {
	constructor({ direction, width = '5px', height = '5px', offset = '0px', styles, helpers }) {
		this.directions = {
			se: this.se,
			nw: this.nw,
			sw: this.sw,
			ne: this.ne,
			n: this.n,
			s: this.s,
			e: this.e,
			w: this.w,
		};
		this.helpers = helpers;
		this.direction = direction;
		this.element = this.makeHandle({ direction, height, offset, width, styles });
		this.start();
	}
	start() {
		this.element.addEventListener('mousedown', this.mouseDown.bind(this));
	}
	hide() {
		this.getHandleElement().style.display = 'none';
	}
	show() {
		this.getHandleElement().style.display = 'block';
	}
	mouseDown(e) {
		e.stopPropagation();
		this.anchorPoint = {
			x: e.pageX,
			y: e.pageY,
		};
		this.engageController = new AbortController();
		document.addEventListener('mousemove', this.directions[this.direction].bind(this), {
			signal: this.engageController.signal,
		});
		document.addEventListener('mouseup', this.mouseUp.bind(this), { signal: this.engageController.signal });
	}
	mouseUp() {
		this.engageController.abort();
	}
	se(e) {
		const { pageX, pageY } = e;

		// Vertical move
		const newHeight = this.helpers.getMarkerHeight() + pageY - this.anchorPoint.y;
		this.helpers.setMarkerHeight(newHeight);
		this.anchorPoint.y = pageY;

		// Horizontal move
		const newWidth = this.helpers.getMarkerWidth() + pageX - this.anchorPoint.x;
		this.helpers.setMarkerWidth(newWidth);
		this.anchorPoint.x = pageX;
	}
	nw(e) {
		const { pageX, pageY } = e;
		const { x: containerX, y: containerY } = this.helpers.getLayoutPosition();

		// Horizontal move
		const newWidth = this.anchorPoint.x - pageX + this.helpers.getMarkerWidth();
		this.anchorPoint.x = pageX;
		this.helpers.setMarkerX(pageX - containerX);
		this.helpers.setMarkerWidth(newWidth);

		// Vertical move
		const newHeight = this.anchorPoint.y - pageY + this.helpers.getMarkerHeight();
		this.anchorPoint.y = pageY;
		this.helpers.setMarkerY(pageY - containerY);
		this.helpers.setMarkerHeight(newHeight);
	}
	sw(e) {
		const { pageY, pageX } = e;

		// Vertical move
		const newHeight = this.helpers.getMarkerHeight() + pageY - this.anchorPoint.y;
		this.helpers.setMarkerHeight(newHeight);
		this.anchorPoint.y = pageY;

		// Horizontal move

		const newWidth = this.anchorPoint.x - pageX + this.helpers.getMarkerWidth();
		this.helpers.setMarkerWidth(newWidth);
		this.anchorPoint.x = pageX;
		const { x: containerX } = this.helpers.getLayoutPosition();
		this.helpers.setMarkerX(pageX - containerX);
	}
	ne(e) {
		const { pageX, pageY } = e;

		// Horizontal move
		this.helpers.setMarkerWidth(this.helpers.getMarkerWidth() + pageX - this.anchorPoint.x);
		this.anchorPoint.x = pageX;

		// Vertical move
		const newHeight = this.helpers.getMarkerHeight() + this.anchorPoint.y - pageY;
		this.helpers.setMarkerHeight(newHeight);
		this.anchorPoint.y = pageY;

		const { y: containerY } = this.helpers.getLayoutPosition();
		const newY = pageY - containerY;
		this.helpers.setMarkerY(newY);
	}
	n(e) {
		console.log('north');
		const { pageY } = e;
		const newHeight = this.helpers.getMarkerHeight() + this.anchorPoint.y - pageY;
		this.helpers.setMarkerHeight(newHeight);
		this.anchorPoint.y = pageY;
		const { y: containerY } = this.helpers.getLayoutPosition();
		this.helpers.setMarkerY(pageY - containerY);
	}
	s(e) {
		console.log('south');
		const { pageY } = e;
		const { topEdgeY: markerTopEdgeY } = this.helpers.getMarkerPosition();
		const { bottomEdgeY: layoutBottomEdgeY } = this.helpers.getLayoutPosition();
		const newHeight = this.helpers.getMarkerHeight() + pageY - this.anchorPoint.y; // This equation is correct but if the user moves the mouse rapidly, then in an edge case the marker overflows the layout.
		if (pageY >= layoutBottomEdgeY || newHeight + markerTopEdgeY >= layoutBottomEdgeY) {
			const maxHeight = layoutBottomEdgeY - markerTopEdgeY; // If height increases above this the marker will overflow the layout from the bottom.
			this.helpers.setMarkerHeight(maxHeight);
		} else {
			this.helpers.setMarkerHeight(newHeight);
			this.anchorPoint.y = pageY;
		}
	}
	e(e) {
		console.log('east');
		const { pageX } = e;
		const { rightEdgeX: layoutRightEdgeX } = this.helpers.getLayoutPosition();
		const { leftEdgeX: markerLeftEdgeX } = this.helpers.getMarkerPosition();
		const newWidth = this.helpers.getMarkerWidth() + pageX - this.anchorPoint.x;
		if (pageX >= layoutRightEdgeX || newWidth + markerLeftEdgeX >= layoutRightEdgeX) {
			const maxWidth = layoutRightEdgeX - markerLeftEdgeX;
			this.helpers.setMarkerWidth(maxWidth);
		} else {
			this.helpers.setMarkerWidth(newWidth);
			this.anchorPoint.x = pageX;
		}
	}
	w(e) {
		console.log('west');
		const { pageX } = e;
		const newWidth = this.helpers.getMarkerWidth() + this.anchorPoint.x - pageX;
		this.helpers.setMarkerWidth(newWidth);

		const { leftEdgeX: layoutLeftEdgeX } = this.helpers.getLayoutPosition();
		if (pageX <= layoutLeftEdgeX) {
			const { leftEdgeX: markerLeftEdgeX } = this.helpers.getMarkerPosition();
			const maxWidth = layoutLeftEdgeX - markerLeftEdgeX;
		}
		this.helpers.setMarkerX(pageX - layoutLeftEdgeX);
		this.anchorPoint.x = pageX;
	}
	mouseMove() {}
	getHandleElement() {
		return this.element;
	}
	makeHandle({ direction, height, offset, width, styles }) {
		const getPosition = (direction) => {
			const getOffset = () => {
				return isValidUnit(offset) ? offset : `${offset}px`;
			};
			const positions = {
				nw: {
					left: getOffset(),
					top: getOffset(),
					cursor: 'nw-resize',
				},
				se: {
					bottom: getOffset(),
					right: getOffset(),
					cursor: 'se-resize',
				},
				ne: {
					right: getOffset(),
					top: getOffset(),
					cursor: 'ne-resize',
				},
				sw: {
					left: getOffset(),
					bottom: getOffset(),
					cursor: 'sw-resize',
				},
				n: {
					top: getOffset(),
					left: '50%',
					transform: 'translateX(-50%)',
					cursor: 'n-resize',
				},
				s: {
					bottom: getOffset(),
					left: '50%',
					transform: `translateX(-50%)`,
					cursor: 's-resize',
				},
				e: {
					right: getOffset(),
					top: '50%',
					transform: 'translateY(-50%)',
					cursor: 'e-resize',
				},
				w: {
					left: getOffset(),
					transform: 'translateY(-50%)',
					top: '50%',
					cursor: 'w-resize',
				},
			};
			return positions[direction];
		};
		const handle = document.createElement('div');
		handle.draggable = false;
		Object.assign(
			handle.style,
			{
				height,
				width,
				position: 'absolute',
				boxSizing: 'border-box',
			},
			getPosition(direction),
			styles,
		);
		return handle;
	}
}
