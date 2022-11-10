const { createEvent } = require('@posthog/plugin-scaffold/test/utils')
const { processEvent } = require('.')

const global = {
    propertiesToFilter: [
        'gender',
        '$set.age',
        'foo.bar.baz.one',
        'nonExisting',
        'something.else.a',
        'top_null_but_removed',
        'flatten.string.to.remove',

        'meta.one.unknown',
        'meta.second.fourth',
        'meta.second.empty_key_delete_null',
    ],
}

const properties = {
    properties: {
        name: 'Mr. Hog',
        gender: 'male',
        $set: {
            age: 35,
            pet: 'dog',
            firstName: 'Post',
        },
        foo: {
            bar: {
                baz: {
                    one: 'one',
                    two: 'two',
                },
            },
        },

        top_null_key: null,
        top_null_key_undefined: undefined,
        top_null_but_removed: null,

        meta: {
            one: 'one',
            second: {
                two: 'two',
                three: 'three',
                fourth: [
                    {
                        name: 'test',
                    },
                ],
                empty_key_null: null,
                empty_key_delete_null: null,
                empty_key_undefined: undefined,
            },
        },

        'flatten.string.to.remove': {
            four: 'four',
            five: 'five',
        },

        'flatten.string.to.remove.not': {
            two: 'two',
            seven: 'seven',
        },

        'flatten.string.to.good': true,
    },
}

test('event properties are filtered', async () => {
    const event = await processEvent(createEvent(properties), { global })
    console.log(JSON.stringify(event, null, 2))
    expect(event.properties).not.toHaveProperty('gender')
    expect(event.properties).not.toHaveProperty('something')
    expect(event.properties).not.toHaveProperty(['flatten.string.to.remove'])
    expect(event.properties).toHaveProperty(['flatten.string.to.remove.not'])
    expect(event.properties.$set).not.toHaveProperty('age')
    expect(event.properties.foo.bar.baz).not.toHaveProperty('one')
    expect(event.properties).toHaveProperty('name')
    expect(event.properties).toHaveProperty('$set')
    expect(event.properties).toHaveProperty('foo')
    expect(event.properties).toHaveProperty('top_null_key')
    expect(event.properties).toHaveProperty('top_null_key_undefined')
    expect(event.properties).not.toHaveProperty('topnull_but_removed')
    expect(event.properties['flatten.string.to.good']).toEqual(true)
    expect(event.properties.$set).toHaveProperty('firstName', 'Post')
    expect(event.properties.foo.bar.baz).toHaveProperty('two', 'two')
    expect(event.properties.meta).toHaveProperty('one', 'one')
    expect(event.properties.meta.second).toHaveProperty('two', 'two')
    expect(event.properties.meta.second).toHaveProperty('empty_key_null', null)
    expect(event.properties.meta.second).toHaveProperty('empty_key_undefined', undefined)
    expect(event.properties.meta.second).not.toHaveProperty('empty_key_delete_null')
    expect(event.properties.meta.second).not.toHaveProperty('fourth')
})
