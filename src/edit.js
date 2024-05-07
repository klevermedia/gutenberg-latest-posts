import { __ } from "@wordpress/i18n"
import { PanelBody, FormTokenField } from '@wordpress/components'
import { useBlockProps, InspectorControls } from '@wordpress/block-editor'
import { useState, useEffect } from '@wordpress/element'
import apiFetch from '@wordpress/api-fetch'

const Edit = ({ attributes, setAttributes }) => {
    const blockProps = useBlockProps()

    const { post } = attributes

    // Fetch latest posts and store them in state, also store a map of post titles to post IDs
    const [latestPosts, setLatestPosts] = useState([])
    const [postTitleToID, setPostTitleToID] = useState({})

    const handleChange = (value) => {
        if (value !== '' || value !== null) {
            // Filter posts that are not in the latest posts to avoid user inputting invalid post title
            const filter = value.filter((t) => latestPosts.includes(t));

            setAttributes({
                post: {
                    title: filter,
                    id: postTitleToID[filter]
                }
            })
        }
    }

    useEffect(() => {
        apiFetch({ path: '/wp/v2/posts' })
            .then(posts => {
                const titles = []
                const titleToIdMap = {}
                
                // Loop posts and store titles in an array, also store a map of post titles to post IDs
                posts.forEach(post => {
                    const title = post.title.rendered
                    titles.push(title)
                    titleToIdMap[title] = post.id.toString()
                })
                
                setLatestPosts(titles)
                setPostTitleToID(titleToIdMap)
            })
            .catch(error => {
                console.error('Error fetching posts:', error)
            })
    }, [])

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Select post', 'lee-recent-posts')}>
                    <FormTokenField
                        label="Select a post"
                        onChange={handleChange}
                        suggestions={latestPosts}
                        value={post ? post.title : null}
                    />
                </PanelBody>
            </InspectorControls>

            <div>Title: {post ? post.title : ''}, ID: {post ? post.id : ''}</div>
        </div>
    )
}

export default Edit
