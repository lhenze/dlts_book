<?php

function theme_yui3_annotation_input_template() {
  $output  = '<div data-vector="{{vid}}" class="docos-box annotations-input docos-docoview jfk-scrollbar docos-anchoreddocoview" tabindex="0">';
  $output .= '<div class="docos-anchoreddocoview-arrow-outer"></div>';
  $output .= '<div class="docos-anchoreddocoview-arrow-inner"></div>';
  $output .= '<div class="docos-anchoreddocoview-content">';
  $output .= '<div class="docos-anchoredreplyview docos-replyview-first">';
  $output .= '<img class="docos-avatar docos-anchoredreplyview-avatar" width="24" height="24" src="/home/assets/images/silhouette200.png">';
  $output .= '<div class="docos-anchoredreplyview-author docos-author">Alberto Ortiz Flores</div>';
  $output .= '<div class="docos-anchoredreplyview-timestamp docos-replyview-timestamp"></div>';
  $output .= '<div class="docos-collapsible-replyview docos-replyview-static">';
  $output .= '<div class="docos-replyview-body docos-anchoredreplyview-body"></div>';
  $output .= '<div class="docos-show-more">Show more</div>';
  $output .= '<div class="docos-show-less">Show less</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '<div class="docos-input docos-anchoreddocoview-input-pane docos-draftdiscussionview-input-pane docos-docoview-input-pane docos-input-typing docos-input-nohide">';
  $output .= '<div class="docos-input-spinner" style="display: none"></div>';
  $output .= '<textarea class="docos-input-textarea" x-webkit-speech="" speech="" aria-haspopup="true" maxlength="2048" style="height: 25px; " aria-activedescendant=""></textarea>';
  $output .= '<div class="docos-input-buttons">';
  $output .= '<div role="button" class="goog-inline-block jfk-button jfk-button-action docos-input-post" title="Post comment" style="-webkit-user-select: none; " aria-disabled="false" tabindex="0"><span class="docos-input-buttons-post">Comment</span></div>';
  $output .= '<div role="button" class="goog-inline-block jfk-button jfk-button-standard docos-input-cancel" tabindex="0" title="Discard comment" style="-webkit-user-select: none; ">Cancel</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '</div>';
  return $output;
}

function theme_yui3_annotation_body_template() {
  $output  = '<div id="annon{{id}}" data-vector="{{vid}}" class="docos-box docos-docoview jfk-scrollbar docos-anchoreddocoview" tabindex="0">';
  $output .= '<div class="docos-anchoreddocoview-arrow-outer"></div>';
  $output .= '<div class="docos-anchoreddocoview-arrow-inner"></div>';
  $output .= '<div class="docos-anchoreddocoview-content docos-docoview-replycontainer jfk-scrollbar">';
  $output .= '<div class="docos-docoview-rootreply">';
  $output .= '<div class="docos-anchoredreplyview docos-replyview-first">';
  $output .= '<img class="docos-avatar docos-anchoredreplyview-avatar" width="24" height="24" src="/home/assets/images/silhouette200.png">';
  $output .= '<div class="docos-anchoredreplyview-author docos-author">{{username}}</div>';
  $output .= '<div class="docos-anchoredreplyview-timestamp docos-replyview-timestamp">{{modification_date_utc}}</div>';
  $output .= '<div class="docos-collapsible-replyview docos-replyview-static">';
  $output .= '<div class="docos-replyview-body docos-anchoredreplyview-body">{{text}}</div>';
  $output .= '<div class="docos-show-more">Show more</div>';
  $output .= '<div class="docos-show-less" style="display: none; ">Show less</div>';
  $output .= '</div>';
  $output .= '<div class="docos-replyview-control docos-replyview-static goog-inline-block hide-on-readonly">';
  $output .= '<div class="docos-replyview-edit goog-inline-block" role="button" tabindex="0" title="Make changes to your comment">Edit</div>';
  $output .= '<div class="docos-replyview-delete goog-inline-block" role="button" tabindex="0" title="Permanently delete your comment">Delete</div>';
  $output .= '</div>';
  $output .= '<div class="docos-input docos-anchoredreplyview-edit-pane docos-replyview-edit-pane" style="display: ';
  $output .= '<div class="docos-input-spinner" style="display: none"></div>';
  $output .= '<textarea class="docos-input-textarea docos-noclick" x-webkit-speech="" speech="" aria-haspopup="true" maxlength="2048"></textarea>';
  $output .= '<div class="docos-input-at-reply-message" style="display: none">Your +mention will add people to this post and send an email.</div>';
  $output .= '<div class="docos-input-buttons">';
  $output .= '<div role="button" class="goog-inline-block jfk-button jfk-button-action docos-input-post" tabindex="0" title="Post comment" style="-webkit-user-select: none; "><span class="docos-input-buttons-post">Save</span></div>';
  $output .= '<div role="button" class="goog-inline-block jfk-button jfk-button-standard docos-input-cancel" tabindex="0" title="Discard comment" style="-webkit-user-select: none; ">Cancel</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '<div class="docos-anchoreddocoview-resolvebutter" style="display:none">';
  $output .= '<div class="docos-resolvebutter-header goog-inline-block">Comment Resolved</div>';
  $output .= '<div class="docos-resolvebutter-undo goog-inline-block" role="button" tabindex="0" title="Undo resolve and leave discussion as open">Undo</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '<div class="docos-anchoreddocoview-resolve-button hide-on-readonly">';
  $output .= '<div role="button" class="goog-inline-block jfk-button jfk-button-standard docos-docoview-resolve-button" tabindex="0" title="Mark as resolved and hide discussion" style="-webkit-user-select: none; ">Resolve</div>';
  $output .= '</div>';
  $output .= '<div class="docos-input docos-anchoreddocoview-input-pane docos-docoview-input-pane hide-on-readonly">';
  $output .= '<div class="docos-input-spinner" style="display: none"></div>';
  $output .= '<textarea class="docos-input-textarea" x-webkit-speech="" speech="" aria-haspopup="true" maxlength="2048"></textarea>';
  $output .= '<div class="docos-input-at-reply-message" style="display: none">Your +mention will add people to this post and send an email.</div>';
  $output .= '<div class="docos-input-buttons">';
  $output .= '<div role="button" class="goog-inline-block jfk-button jfk-button-action docos-input-post" tabindex="0" title="Reply to comment" style="-webkit-user-select: none; "><span class="docos-input-buttons-post">Reply</span></div>';
  $output .= '<div role="button" class="goog-inline-block jfk-button jfk-button-standard docos-input-cancel" tabindex="0" title="Discard comment" style="-webkit-user-select: none; ">Cancel</div>';
  $output .= '</div>';
  $output .= '</div>';
  $output .= '<div class="docos-showrepliesbutton" style="display: none; ">';
  $output .= '<div class="docos-showrepliesbutton-collapsed"></div>';
  $output .= '</div>';
  $output .= '</div>';
  return $output; 
}

function theme_pages_carousel() {
  $output = '
    <li class="carousel-li-item carousel-item-{{sequence}}" data-sequence="{{sequence}}" data-title="{{title}}">
      <div>
        <a class="carousel-item-link yui3-pjax" href="'. base_path() .'books/{{identifier}}/{{sequence}}"><div class="yui3-carousel-item-container"><img id="thumb-{{sequence}}" src="{{#thumbnail}}{{image}}{{/thumbnail}}" /></div></a>
        <span class="sequence page-number">{{sequence}}</span>
      </div>
    </li>';
  return $output;
}
