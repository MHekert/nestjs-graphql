# Nest.js Graphql

## Contents

Repository contains Nest.js application with couple modules showcasing most common concepts and use cases of GraphQL within Nest.js framework using `code first` approach.

Application uses PostgreSQL and TypeORM for handling persistent data. In total app uses three different entities `Users`, `Profiles` nad `Posts`. That number of entities allow to fully showcase querying for objects with `one to one`, `many to one` and `one to many` relations. It also allows showcasing implementation of pagination compliant with the [relay](https://relay.dev/graphql/connections.htm) specification, solution to `n+1 problem` using [graphql/dataloader](https://github.com/graphql/dataloader) and integration with `passport.js` for JWT Authentication.

## Directory structure

```
.
├── migrations
├── mocks
├── src
│   ├── common
│   │   ├── dto
│   │   ├── enums
│   │   └── utils
│   ├── config
│   └── modules
│       ├── auth
│       │   ├── config
│       │   ├── dto
│       │   └── entities
│       ├── posts
│       │   ├── dto
│       │   ├── entities
│       │   └── repositories
│       ├── profiles
│       │   ├── dto
│       │   ├── entities
│       │   └── repositories
│       └── users
│           ├── dto
│           ├── entities
│           └── repositories
└── test
    └── helpers
```

## Entities

`entities` directory stores classes that are used by Nest.js's graphQL module for building graphQL schema and for TypeORM for defining database entities. Properties can be annotated either with decorators from both libraries or one of them, additionally there could be fields defined and used only by one of them.

```typescript
@ObjectType()
@Entity()
export class Profile extends BaseEntity {
  @PrimaryColumn()
  @Field(() => ID)
  username: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.username)
  user: User;

  @OneToMany(() => Post, (post) => post.profile)
  posts: Post[];

  @Field(() => [PaginatedPosts], { name: 'posts' })
  ownPosts?: IPaginated<Post>;
}
```

Class extends `BaseEntity` of `TypeOrm` and is annotated with `ObjectType` and `Field` decorators allowing automatic generation of graphQL schema. `Profile` entity has property `posts` that is used for mapping properties of its relation. This field is only used by `TypeORM`, in case of `GraphQL` property `ownPosts` is used. This allows for querying using `posts` property name and returning object with pagination compliant with Relay specification.

Example query for retrieving profile:

```graphql
query getProfile($username: String!, $limit: Int!) {
  profile(username: $username) {
    username
    bio
    posts(limit: $limit) {
      totalCount
      hasNextPage
      edges {
        cursor
        node {
          id
          title
        }
      }
    }
  }
}
```

Example response for this query:

```json
{
  "data": {
    "profile": {
      "username": "user1",
      "bio": null,
      "posts": {
        "totalCount": 2,
        "hasNextPage": true,
        "edges": [
          {
            "cursor": "eyJsYXN0SWQiOiI5ZjI0NDQ3Ni0zMGUwLTRjNDUtYTAxNC1kNmI0ZGU3MTRiODQiLCJ0aHJlc2hvbGQiOiIyMDIxLTA0LTI1VDE4OjI2OjQzLjQxNloifQ==",
            "node": {
              "id": "9f244476-30e0-4c45-a014-d6b4de714b84",
              "title": "post 1"
            }
          }
        ]
      }
    }
  }
}
```

## DTO

In `dto` directory other non-entity objects used by graphQL are stored - meaning input objects for mutations arguments objects

```typescript
@InputType()
export class AuthInput {
  @Field()
  @IsString()
  @MaxLength(20)
  username: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;
}
```

```typescript
registerEnumType(OrderEnum, {
  name: 'OrderEnum',
});

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    defaultValue: 20,
    nullable: true,
  })
  @IsInt()
  @Max(100)
  limit?: number = 20;

  @Field(() => String, {
    nullable: true,
  })
  @IsOptional()
  @IsBase64()
  cursor?: string;

  @Field(() => OrderEnum, {
    defaultValue: OrderEnum.DESC,
    nullable: true,
  })
  @IsEnum(OrderEnum)
  order?: OrderEnum = OrderEnum.DESC;
}
```

Both of them take use of Nest.js validation pipeline including integration with [class-validator](https://github.com/typestack/class-validator).

## DataLoaders

By default GraphQL would make for every nested object in array separately which is not ideal - this phenomenon is known as `n+1 problem`. To mitigate it either root entity resolver could join required nested objects and pass it to field resolver as parent object or retrieve elements in batches using Dataloader. Join solution would get more only complicated either by building more complex SQL queries, populating referenced NoSQL documents or even retrieving data from multiple databases. Dataloader provides cleaner way for solving this problem and in addition provides request scoped caching.

```typescript
@ResolveField('profile', () => Profile)
async profile(@Parent() post: Post): Promise<Profile> {
  const { authorUsername } = post;
  return this.profilesLoader.batchProfiles.load(authorUsername);
}
```

```typescript
@Injectable({ scope: Scope.REQUEST })
export default class ProfilesLoader {
  constructor(private profilesService: ProfilesService) {}

  public readonly batchProfiles = new DataLoader(
    async (profilesUsernames: string[]) => {
      const profiles = await this.profilesService.findByUsernames(
        profilesUsernames,
      );
      const profilesMap = new Map(
        profiles.map((profile) => [profile.username, profile]),
      );

      return profilesUsernames.map((profileId) => profilesMap.get(profileId));
    },
  );
}
```

Dataloader batches all requests and caches results per request. Dataloader has to return results in exact order as objects in input array.

## Pagination

To reduce boilerplate for creating different [relay](https://relay.dev/graphql/connections.htm) compliant paginations function creating abstract entities can be used.

```typescript
export function Paginated<T>(classRef: Type<T>): any {
  @ObjectType(`${classRef?.name}Edge`)
  abstract class EdgeType implements IEdge<T> {
    @Field(() => String)
    cursor: string;

    @Field(() => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginated<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field(() => [classRef], { nullable: true })
    nodes: T[];

    @Field(() => Int)
    totalCount: number;

    @Field()
    hasNextPage: boolean;
  }
  return PaginatedType;
}
```

This function takes entity class as parameter and returns another entity. It has to have return type set to `any` since it returns object that uses private name. Other solution to this could be setting `declaration` property to `false` in `tsconfig.json`.

```typescript
@ObjectType(`${classRef?.name}Edge`)
```

This decorator allow multiple `edge` types for different entities in GraphQL schema.

```typescript
@ObjectType({ isAbstract: true })
```

Setting `isAbstract` in `ObjectType` decorator informs Nest.js's GraphQL generator that it should not create this type in GraphQL schema.

New pagination entity can be created by extending returned abstract class by this factory function.

```typescript
@ObjectType()
export class PaginatedPosts extends Paginated(Post) {}
```

Request and response example are provided [entities section](#Entities).

## Passport.js

Integration with `passport.js` is almost identical as its equivalent in REST API. It requires additional step when integrating with `GraphQL` - Guards have to retrieve original request object and map variables to properties required by `passport.js`. Unfortunately this solution requires that credentials would be passed as variables and not directly in query as arguments. To mitigate this problem additional parsing of query in guard could be added.

```typescript
@Injectable()
export class AuthLocalGuard extends AuthGuard('local') implements CanActivate {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    try {
      req.body.username = req.body.variables.authInput.username;
      req.body.password = req.body.variables.authInput.password;
    } catch (err) {
      throw new BadRequestException('Pass arguments as variables');
    }

    return req;
  }
}
```

```typescript
@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') implements CanActivate {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    return req;
  }
}
```

### Running locally

Steps to start app locally:

- start docker compose with PostgreSQL container

```console
$ yarn docker:start
```

- install dependencies

```console
$ yarn install
```

- copy example `.env` file

```console
$ cp .env.example .env
```

- insert necessary environment variables
- run app in development mode

```console
$ yarn start:dev
```

### Testing

To run unit tests:

```console
$ yarn test
```

To run endpoints integration tests:

- copy example envs

```console
$ cp .env.test.example .env.test
```

- insert necessary environment variables
- start docker compose with PostgreSQL container

```console
$ yarn docker:start
```

- run tests

```console
$ yarn test:e2e
```
