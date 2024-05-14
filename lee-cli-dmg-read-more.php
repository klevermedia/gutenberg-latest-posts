<?php

if ( defined( 'WP_CLI' ) && WP_CLI ) {
    WP_CLI::add_command( 'dmg-read-more search', [ 'DMG_Read_More_Search', 'search' ] );
}

class DMG_Read_More_Search {

    public static function search( $args, $usr_args ) {

        // Get date range, default to 30 days ago to today
        $date_before = !empty( $usr_args['date-before'] ) ? $usr_args['date-before'] : date('Y-m-d');
        $date_after = !empty( $usr_args['date-after'] ) ? $usr_args['date-after'] : date('Y-m-d', strtotime('-30 days'));

        // Query arguments
        $query_args = array(
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'date_query'     => array(
                array(
                    'after'     => $date_after,
                    'before'    => $date_before,
                    'inclusive' => true,
                ),
            ),
            'posts_per_page' => -1,
            'fields'         => 'ids',
        );

        $query = new WP_Query( $query_args );

        // Check if posts were found
        $found_posts = false;

        if ( $query->have_posts() ) {
            foreach ( $query->posts as $post_id ) {

                // if post has specific Gutenberg block, log the post ID
                if ( has_block( 'lee-recent-posts-block/lee-recent-posts', $post_id ) ) {
                    WP_CLI::log( $post_id );
                    $found_posts = true;
                }
            }
        }

        if ( !$found_posts ) {
            WP_CLI::log( 'No posts found containing the Recent Posts Gutenberg block within the specified date range.' );
        }

        // If any errors occurred, log them
        if ( $query->get( 'errors' ) ) {
            WP_CLI::error( $query->get( 'errors' ) );
        }
    }
}