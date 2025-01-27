# pda_1_d

## Overview

Just a very basic Anchor project with educational purpose, created as a reminder to see how to manage **indexed PDA** (*Rust and Typescript*).

**PDA definition (Rust):**
```rust
#[account]
pub struct Pda {
    pub index: u16,
}

#[derive(Accounts)]
pub struct PdaCreate<'info> {

    #[account(
        init,
        seeds = [
            b"1D".as_ref(),
            main.index.to_le_bytes().as_ref(),
        ],
        bump,
        payer = signer,
        space = size_of::<Pda>() + 8
    )]
    pub pda: Account<'info, Pda>,

    #[account(mut)]
    pub main: Account<'info, Main>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

**Rust:**
```rust
pub fn pda_create(ctx: Context<PdaCreate>) -> Result<()> {
    msg!("{}:{}", function!(), line!());

    let main: &mut Account<Main> = &mut ctx.accounts.main;
    let pda: &mut Account<Pda>   = &mut ctx.accounts.pda;

    msg!("{}", main.index);
    pda.index   = main.index;
    main.index += 1;

    Ok(())
}
```

**Typescript:**
```typescript
pdaKey = await getPda1dFromIndex( program, "1D", i);
tx     = await program.methods.pdaCreate()
.accounts({
    pda          : pdaKey.pubkey,
    main         : accountMain.publicKey,
    signer       : providerWallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
}).rpc();
```


## Repository tree

```bash
.
├── app
├── migrations
│   └── deploy.ts
├── programs
│   └── pda_1_d
│       ├── src
│       │   └── lib.rs
│       ├── Cargo.toml
│       └── Xargo.toml
├── tests
│   └── pda_1_d.ts
├── Anchor.toml
├── Cargo.lock
├── Cargo.toml
├── package.json
├── README.md
├── tsconfig.json
└── yarn.lock
```


## Launch

### Local validator

`solana-test-validator --reset`

⚠️ Beware it creates local files and directories at the current working directory.


### Real-time logs display

`solana logs`


### Local deploy and launch tests

`anchor test --skip-local-validator`


## Versions

``` 
rustc 1.79.0 (129f3b996 2024-06-10)
cargo 1.79.0 (ffa9cf99a 2024-06-03)
solana-cli 1.18.17 (src:b685182a; feat:4215500110, client:SolanaLabs)
anchor-cli 0.29.0
yarn 1.22.19
node v18.16.0
npm 9.6.7
``` 

`cargo build-sbf -V`
```
solana-cargo-build-sbf 1.18.17
platform-tools v1.41
rustc 1.75.0
```
