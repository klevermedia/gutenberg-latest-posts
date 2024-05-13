import { __ } from "@wordpress/i18n";
import { PanelBody, FormTokenField } from '@wordpress/components';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch, withSelect } from '@wordpress/data';

const Edit = ({ clientId, attributes, setAttributes }) => {
    const blockProps = useBlockProps();
    const dispatch = useDispatch();

    const { post } = attributes;

    const getPosts = useSelect( (select) => { 
        return select('core').getEntityRecords('postType', 'post', {
            per_page: -1
        })
    });

    // Define state variables for post titles and IDs
    const [getPostTitle, setPostTitle] = useState([]);
    const [getPostIDs, setPostIDs] = useState([]);

    useEffect(() => {
        if (getPosts) {
            // Update state variables if posts are fetched
            const titles = getPosts.map(post => post.title.rendered);
            const ids = getPosts.map(post => post.id.toString());
            
            setPostTitle(titles);
            setPostIDs(ids);
        }
    }, [getPosts]);

    useEffect(() => {
        // Replace innerBlock with a core/paragraph block with the post title and a read more link
        if (post) {
            const newBlocks = wp.blocks.createBlock('core/paragraph', { content: `<a href="${post.permalink}">Read more</a>`, className: 'dmg-read-more' });
            dispatch('core/block-editor').replaceInnerBlocks(clientId, [newBlocks], true);
        }

        // Log the selected post for debugging
        console.log(post);

    }, [post, dispatch, clientId]);

    const handleChange = (value) => {
        
        // Check if the value is not empty
        if (value !== '' && value !== null) {
            
            // Filter posts that are not in the latest posts to avoid user inputting invalid post title
            const filter = value.filter((t) => getPostTitle.includes(t));

            if (filter.length > 0) {
                // Get the ID of the first matching post title
                const id = getPostIDs[getPostTitle.indexOf(filter[0])];
                const permalink = getPosts[getPostTitle.indexOf(filter[0])].link;

                setAttributes({
                    post: {
                        title: filter[0],
                        id: id,
                        permalink: permalink
                    }
                });
            } else {
                // No valid post title was filtered, set post to null
                setAttributes({
                    post: null
                });
            }
        }
    }

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Select post', 'lee-recent-posts')}>
                    <FormTokenField
                        label="Select a post"
                        onChange={handleChange}
                        suggestions={getPostTitle}
                        value={post && post.title ? [post.title] : []}
                    />
                </PanelBody>
            </InspectorControls>

            <div>{(post && post.title) ? post.title : 'Select a post...'}</div>
            <InnerBlocks defaultBlock={['core/paragraph', { placeholder: 'Read more', className: 'dmg-read-more' }]} />
        </div>
    )
}

export default withSelect((select, { clientId }) => {
    return {
        innerBlocks: select('core/block-editor').getBlocks(clientId),
    };
})(Edit);
