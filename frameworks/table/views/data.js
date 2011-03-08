// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
// sc_require('views/table_row')
/*globals Endash */

Endash.DataView = SC.ListView.extend(Endash.CollectionFastPath, {
  backgroundColor: 'white',
  rowHeight: 30,
  rowSpacing: 1,
  isSelectable: YES,
  exampleView: SC.TableRowView,
  cellView: Endash.TableCellView,
  cellContentView: SC.LabelView.extend({
    isPoolable: YES,
    layerIsCacheable: YES,
    contentValueKeyBinding: '*column.key',
    
    contentValueKeyDidChange: function() {
      this.updatePropertyFromContent('value', '*', 'contentValueKey');
    }.observes('contentValueKey')
  }),

  cellViewForColumn: function(col) {
    var columns = this.get('columns'),
      column = columns.objectAt(col),
      ret;

    if(ret = column.get('exampleView')) return ret;

    return this.get('cellContentView');
  },

  wakePooledView: function(view, attrs) {
    // configure
    this.configureItemView(view, attrs);

    var layer = view.get('layer');
    this._repositionView(layer, attrs.layout);
    
    // awake from the pool, etc.
    if (view.awakeFromPool) view.awakeFromPool(view.owningPool, this);
    
  },
  
  _repositionView: function(layer, layout) {
    if(SC.platform.touch) {
      var transform = 'translate3d(0px, ' + layout.top + 'px,0)';
      if (layer) {
        layer.style.webkitTransform = transform;
        layer.style.webkitTransformOrigin = "top left";
        layer.style.top = '';
      }
    } else {
      layer.style.top = layout.top + 'px';
    }
  },
  
  /**
    @private
    Sends a view to a DOM pool.
  */
  sendToDOMPool: function(view) {
    var pool = this.domPoolForExampleView(view.createdFromExampleView);
    pool.push(view);
    var f = view.get("frame");
    
    this._repositionView(view.get('layer'), {top: -(f.height + 2)});
    
    // view.adjust({ top: -f.height });
    view.set("layerId", SC.guidFor(view));
    if (view.sleepInDOMPool) view.sleepInDOMPool();
  },
  
  _updateItemView: function(current, object, index) {
    var attrs = this._TMP_ATTRS || (this._TMP_ATTRS = {});

    this.setAttributesForItem(object, index, attrs);
    this.configureItemView(current, attrs);
    this._repositionView(current.get('layer'), attrs.layout);
  },

  reset: function() {
    this.reloadIfNeeded(SC.IndexSet.create(), true);
    delete this._viewMap;
    delete this._indexMap;
    var pools = this._domPools || (this._domPools = {});
    for (var p in pools) {
      for(var i = 0, len = pools[p].length; i < len; i++) {
        pools[p][i].destroy();
      }
      pools[p].length = 0;
    }
    
    this.reloadIfNeeded(null, true);
  },
  
  contentIndexForLayerId: function(id) {
    if (!id || !(id = id.toString())) return null ; // nothing to do
    
    var base = this._baseLayerId;
    if (!base) base = this._baseLayerId = SC.guidFor(this)+"-";
    
    // no match
    if ((id.length <= base.length) || (id.indexOf(base) !== 0)) return null ; 
    var ret = Number(id.split('-')[1])
    return isNaN(ret) ? null : ret ;
  },
  

});
